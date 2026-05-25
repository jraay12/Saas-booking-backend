/*
  Warnings:

  - Added the required column `business_id` to the `ServiceStaff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ServiceStaff` ADD COLUMN `business_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `ServiceStaff_business_id_idx` ON `ServiceStaff`(`business_id`);
