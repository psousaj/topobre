/*
  Warnings:

  - You are about to drop the column `dataVencimento` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `repeteMensalmente` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `description` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueDate` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repeatsMonthly` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "dataVencimento",
DROP COLUMN "descricao",
DROP COLUMN "repeteMensalmente",
DROP COLUMN "tipo",
DROP COLUMN "valor",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "repeatsMonthly" BOOLEAN NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;
