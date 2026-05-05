-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('WEIGHT', 'VOLUME', 'OTHER');

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "tipoUnidade" "UnitType" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "unidadeBase" TEXT DEFAULT 'g';
