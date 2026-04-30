-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PENDING_VERIFICATION';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentProofUrl" TEXT;
