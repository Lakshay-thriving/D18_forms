/*
  Warnings:

  - Added the required column `signatureHash` to the `DigitalSignature` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signerEmail` to the `DigitalSignature` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signerRole` to the `DigitalSignature` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DigitalSignature" ADD COLUMN     "documentHash" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "signatureHash" TEXT NOT NULL,
ADD COLUMN     "signerEmail" TEXT NOT NULL,
ADD COLUMN     "signerRole" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PrintHistory" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "printedById" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "statusAtPrint" TEXT NOT NULL,
    "stageAtPrint" TEXT,
    "documentData" TEXT NOT NULL,
    "printedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrintHistory_requestId_idx" ON "PrintHistory"("requestId");

-- CreateIndex
CREATE INDEX "PrintHistory_printedById_idx" ON "PrintHistory"("printedById");

-- CreateIndex
CREATE INDEX "PrintHistory_version_idx" ON "PrintHistory"("version");

-- AddForeignKey
ALTER TABLE "PrintHistory" ADD CONSTRAINT "PrintHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "NOCRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintHistory" ADD CONSTRAINT "PrintHistory_printedById_fkey" FOREIGN KEY ("printedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
