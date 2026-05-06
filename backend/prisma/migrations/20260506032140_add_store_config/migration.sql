-- CreateTable
CREATE TABLE "store_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "bankName" TEXT NOT NULL DEFAULT 'Banco Mercantil Santa Cruz',
    "bankHolder" TEXT NOT NULL DEFAULT 'NOVA Store SRL',
    "bankAccount" TEXT NOT NULL DEFAULT '1234567890',
    "qrImageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_config_pkey" PRIMARY KEY ("id")
);
