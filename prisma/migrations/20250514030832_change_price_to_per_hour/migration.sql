/*
  Warnings:

  - You are about to drop the column `pricePerMinute` on the `ExpertProfile` table. All the data in the column will be lost.
  - Added the required column `pricePerHour` to the `ExpertProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExpertProfile" DROP COLUMN "pricePerMinute",
ADD COLUMN     "pricePerHour" DOUBLE PRECISION NOT NULL;
