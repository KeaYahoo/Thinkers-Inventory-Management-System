-- CreateEnum
CREATE TYPE "TransferDirection" AS ENUM ('TO_VEHICLE', 'FROM_VEHICLE');

-- CreateTable
CREATE TABLE "Transfer" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "vehicleId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "direction" "TransferDirection" NOT NULL,
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
