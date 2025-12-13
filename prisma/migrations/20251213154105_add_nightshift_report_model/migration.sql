-- AlterTable
ALTER TABLE "Consumption" ADD COLUMN     "vehicleId" INTEGER;

-- CreateTable
CREATE TABLE "NightShiftReport" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "vehicleId" INTEGER,
    "staff" TEXT NOT NULL,
    "shiftSummary" TEXT NOT NULL,
    "incidents" TEXT,
    "nonCompliance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NightShiftReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NightShiftReport" ADD CONSTRAINT "NightShiftReport_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
