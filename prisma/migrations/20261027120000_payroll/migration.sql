-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "scheduledMinutes" INTEGER NOT NULL DEFAULT 1200,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayRate" (
    "id" TEXT NOT NULL,
    "effectiveFrom" TEXT NOT NULL,
    "rateCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayRate_effectiveFrom_key" ON "PayRate"("effectiveFrom");


-- Starting values: $25.00/hour, 20 scheduled hours a week, from the week the
-- portal went live.
INSERT INTO "Settings" ("id", "scheduledMinutes") VALUES (1, 1200);
INSERT INTO "PayRate" ("id", "effectiveFrom", "rateCents") VALUES ('initial_rate', '2026-10-12', 2500);
