-- CreateTable
CREATE TABLE "GroceryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qty" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "addedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gotAt" TIMESTAMP(3),
    "gotBy" TEXT,
    "boughtQty" INTEGER,
    "stapleId" TEXT,

    CONSTRAINT "GroceryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staple" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT 'Pantry',
    "minStock" INTEGER NOT NULL,
    "onHand" INTEGER NOT NULL DEFAULT 0,
    "countedAt" TIMESTAMP(3),
    "countedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrepItem" (
    "id" TEXT NOT NULL,
    "weekOf" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" TEXT NOT NULL DEFAULT '',
    "details" TEXT NOT NULL DEFAULT '',
    "prepDay" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "note" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "PrepItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroceryItem_gotAt_idx" ON "GroceryItem"("gotAt");

-- CreateIndex
CREATE INDEX "PrepItem_weekOf_idx" ON "PrepItem"("weekOf");

-- AddForeignKey
ALTER TABLE "GroceryItem" ADD CONSTRAINT "GroceryItem_stapleId_fkey" FOREIGN KEY ("stapleId") REFERENCES "Staple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

