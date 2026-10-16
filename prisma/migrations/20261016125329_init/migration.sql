-- CreateTable
CREATE TABLE "Duty" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "area" TEXT NOT NULL DEFAULT 'General',
    "days" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "onceDate" TEXT,
    "dueBy" TEXT NOT NULL DEFAULT '',
    "priority" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Duty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day" (
    "date" TEXT NOT NULL,
    "ownerNote" TEXT NOT NULL DEFAULT '',
    "reportDid" TEXT NOT NULL DEFAULT '',
    "reportExtra" TEXT NOT NULL DEFAULT '',
    "reportIssues" TEXT NOT NULL DEFAULT '',
    "reportAt" TIMESTAMP(3),
    "reportEditedAt" TIMESTAMP(3),
    "dueSnapshot" JSONB,
    "reviewNote" TEXT NOT NULL DEFAULT '',
    "reviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "clockOut" TIMESTAMP(3),
    "editedByOwner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Completion" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "dutyId" TEXT,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "note" TEXT NOT NULL DEFAULT '',
    "reason" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Completion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Shift_date_idx" ON "Shift"("date");

-- CreateIndex
CREATE INDEX "Shift_clockOut_idx" ON "Shift"("clockOut");

-- CreateIndex
CREATE INDEX "Completion_date_idx" ON "Completion"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Completion_date_dutyId_key" ON "Completion"("date", "dutyId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- AddForeignKey
ALTER TABLE "Completion" ADD CONSTRAINT "Completion_dutyId_fkey" FOREIGN KEY ("dutyId") REFERENCES "Duty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
