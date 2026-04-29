import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@shared/application/decorators/public.decorator';
import { Roles } from '@shared/application/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/application/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/application/guards/roles.guard';
import {
  CreateCategoryDto,
  CreateProductDto,
  ListProductsQueryDto,
  UpdateProductDto,
} from '../../application/dtos/product.dtos';
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  ListCategoriesUseCase,
} from '../../application/use-cases/category.use-cases';
import {
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductByIdUseCase,
  ListProductsUseCase,
  UpdateProductUseCase,
} from '../../application/use-cases/product.use-cases';

@ApiTags('Productos')
@ApiBearerAuth('JWT')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
    private readonly getProduct: GetProductByIdUseCase,
    private readonly listProducts: ListProductsUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar productos con filtros y paginación' })
  @Public()
  @Get()
  list(@Query() query: ListProductsQueryDto) {
    return this.listProducts.execute(query);
  }

  @ApiOperation({ summary: 'Obtener producto por ID' })
  @Public()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.getProduct.execute(id);
  }

  @ApiOperation({ summary: '[ADMIN] Crear producto' })
  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProductDto) {
    return this.createProduct.execute(dto);
  }

  @ApiOperation({ summary: '[ADMIN] Actualizar producto' })
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.updateProduct.execute(id, dto);
  }

  @ApiOperation({ summary: '[ADMIN] Eliminar producto' })
  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteProduct.execute(id);
  }
}

@ApiTags('Categorías')
@ApiBearerAuth('JWT')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
    private readonly listCategories: ListCategoriesUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar todas las categorías' })
  @Public()
  @Get()
  list() {
    return this.listCategories.execute();
  }

  @ApiOperation({ summary: '[ADMIN] Crear categoría' })
  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCategoryDto) {
    return this.createCategory.execute(dto);
  }

  @ApiOperation({ summary: '[ADMIN] Eliminar categoría' })
  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteCategory.execute(id);
  }
}
