/*
  Warnings:

  - Added the required column `email_address` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `aditional_notes` VARCHAR(191) NULL,
    ADD COLUMN `email_address` VARCHAR(191) NOT NULL,
    ADD COLUMN `first_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `last_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `payment_method` ENUM('CASH', 'BANK') NOT NULL,
    ADD COLUMN `phone_number` VARCHAR(191) NOT NULL;
