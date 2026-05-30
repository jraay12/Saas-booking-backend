/*
  Warnings:

  - A unique constraint covering the columns `[staff_id,booking_date,start_time]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Booking_staff_id_booking_date_start_time_key` ON `Booking`(`staff_id`, `booking_date`, `start_time`);
