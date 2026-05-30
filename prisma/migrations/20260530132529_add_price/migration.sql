/*
  Warnings:

  - Added the required column `service_price` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `service_price` DECIMAL(10, 2) NOT NULL;
