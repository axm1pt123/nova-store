import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';
import { Roles } from '@shared/application/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/application/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/application/guards/roles.guard';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'tu_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'tu_api_key';

@ApiTags('Upload')
@ApiBearerAuth('JWT')
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UploadController {
  @ApiOperation({ summary: '[ADMIN] Subir imagen de producto' })
  @ApiConsumes('multipart/form-data')
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Solo se permiten imágenes JPG, PNG, WEBP o GIF'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');

    if (cloudinaryConfigured) {
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'nova-store/products',
            transformation: [
              { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error || !result) return reject(error ?? new Error('Error al subir imagen'));
            resolve(result as { secure_url: string });
          },
        ).end(file.buffer);
      });

      return { url: result.secure_url };
    }

    // Fallback: almacenamiento local (solo desarrollo)
    const ext = extname(file.originalname) || '.jpg';
    const filename = `${randomBytes(16).toString('hex')}${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), file.buffer);

    const port = process.env.PORT ?? '3001';
    return { url: `http://localhost:${port}/uploads/${filename}` };
  }
}
