-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('APPLICANT', 'REGISTRAR', 'JOINT_REGISTRAR', 'ESTABLISHMENT_1', 'ESTABLISHMENT_2', 'ADMIN');

-- CreateEnum
CREATE TYPE "NOCStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PENDING_REGISTRAR', 'PENDING_JOINT_REGISTRAR', 'PENDING_ESTABLISHMENT', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('NO_OBJECTION', 'RESIDENCE_PROOF', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicantType" AS ENUM ('FACULTY', 'STAFF');

-- CreateEnum
CREATE TYPE "PassportType" AS ENUM ('PASSPORT', 'NON_PASSPORT');

-- CreateEnum
CREATE TYPE "ReplyType" AS ENUM ('PASSPORT_PATH', 'NON_PASSPORT_PATH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTPVerification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "OTPVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NOCRequest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "status" "NOCStatus" NOT NULL DEFAULT 'DRAFT',
    "applicantId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "certificateType" "CertificateType" NOT NULL,
    "applicantType" "ApplicantType" NOT NULL,
    "passportType" "PassportType" NOT NULL,
    "presentAddress" TEXT NOT NULL,
    "permanentAddress" TEXT,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "employeeCode" TEXT,
    "currentStage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "NOCRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NOCApproval" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "approverRole" "UserRole" NOT NULL,
    "approverId" TEXT,
    "status" TEXT NOT NULL,
    "comments" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NOCApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalSignature" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "signerId" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stage" TEXT NOT NULL,

    CONSTRAINT "DigitalSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NOCReply" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "replyType" "ReplyType" NOT NULL,
    "letterPath" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NOCReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "OTPVerification_email_idx" ON "OTPVerification"("email");

-- CreateIndex
CREATE INDEX "OTPVerification_expiresAt_idx" ON "OTPVerification"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "NOCRequest_requestId_key" ON "NOCRequest"("requestId");

-- CreateIndex
CREATE INDEX "NOCRequest_applicantId_idx" ON "NOCRequest"("applicantId");

-- CreateIndex
CREATE INDEX "NOCRequest_status_idx" ON "NOCRequest"("status");

-- CreateIndex
CREATE INDEX "NOCRequest_requestId_idx" ON "NOCRequest"("requestId");

-- CreateIndex
CREATE INDEX "NOCRequest_createdAt_idx" ON "NOCRequest"("createdAt");

-- CreateIndex
CREATE INDEX "NOCApproval_requestId_idx" ON "NOCApproval"("requestId");

-- CreateIndex
CREATE INDEX "NOCApproval_approverRole_idx" ON "NOCApproval"("approverRole");

-- CreateIndex
CREATE INDEX "NOCApproval_approverId_idx" ON "NOCApproval"("approverId");

-- CreateIndex
CREATE INDEX "DigitalSignature_requestId_idx" ON "DigitalSignature"("requestId");

-- CreateIndex
CREATE INDEX "DigitalSignature_signerId_idx" ON "DigitalSignature"("signerId");

-- CreateIndex
CREATE INDEX "NOCReply_requestId_idx" ON "NOCReply"("requestId");

-- CreateIndex
CREATE INDEX "NOCReply_applicantId_idx" ON "NOCReply"("applicantId");

-- CreateIndex
CREATE INDEX "Attachment_requestId_idx" ON "Attachment"("requestId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "OTPVerification" ADD CONSTRAINT "OTPVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOCRequest" ADD CONSTRAINT "NOCRequest_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOCApproval" ADD CONSTRAINT "NOCApproval_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "NOCRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOCApproval" ADD CONSTRAINT "NOCApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalSignature" ADD CONSTRAINT "DigitalSignature_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "NOCRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalSignature" ADD CONSTRAINT "DigitalSignature_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOCReply" ADD CONSTRAINT "NOCReply_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "NOCRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOCReply" ADD CONSTRAINT "NOCReply_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "NOCRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
