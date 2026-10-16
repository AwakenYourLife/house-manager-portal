-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isTask" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seenAt" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),
    "doneNote" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");

