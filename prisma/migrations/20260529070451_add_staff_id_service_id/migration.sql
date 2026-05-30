/*
  Warnings:

  - Added the required column `service_id` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staff_id` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `service_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `staff_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Booking_service_id_idx` ON `Booking`(`service_id`);

-- CreateIndex
CREATE INDEX `Booking_staff_id_idx` ON `Booking`(`staff_id`);

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Booking` RENAME INDEX `Booking_business_id_fkey` TO `Booking_business_id_idx`;
