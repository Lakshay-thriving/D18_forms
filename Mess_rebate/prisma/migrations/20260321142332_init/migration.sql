-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'MESS_MANAGER', 'CARETAKER', 'JUNIOR_SUPERINTENDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "Course" AS ENUM ('UG', 'PG', 'PHD');

-- CreateEnum
CREATE TYPE "RebateType" AS ENUM ('PERSONAL_LEAVE', 'OFFICIAL_DUTY_LEAVE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'MESS_MANAGER_APPROVED', 'MESS_MANAGER_REJECTED', 'CARETAKER_APPROVED', 'CARETAKER_REJECTED', 'CARETAKER_SENT_BACK', 'JS_APPROVED', 'JS_REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryNumber" TEXT,
    "course" "Course",
    "hostelName" TEXT,
    "roomNumber" TEXT,
    "messName" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rebate_requests" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rebateType" "RebateType" NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "totalMeals" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
    "documentUrl" TEXT,
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "rebate_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "approverRole" "UserRole" NOT NULL,
    "approverId" TEXT,
    "messManagerId" TEXT,
    "caretakerId" TEXT,
    "juniorSuperintendentId" TEXT,
    "approved" BOOLEAN,
    "remarks" TEXT,
    "confirmedMeals" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semester_rebate_tracker" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "totalDaysUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semester_rebate_tracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hostels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_entryNumber_key" ON "users"("entryNumber");

-- CreateIndex
CREATE UNIQUE INDEX "semester_rebate_tracker_studentId_semester_key" ON "semester_rebate_tracker"("studentId", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "hostels_name_key" ON "hostels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "messes_name_key" ON "messes"("name");

-- AddForeignKey
ALTER TABLE "rebate_requests" ADD CONSTRAINT "rebate_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "rebate_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_messManagerId_fkey" FOREIGN KEY ("messManagerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_caretakerId_fkey" FOREIGN KEY ("caretakerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_juniorSuperintendentId_fkey" FOREIGN KEY ("juniorSuperintendentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
