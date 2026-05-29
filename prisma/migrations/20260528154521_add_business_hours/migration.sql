-- CreateTable
CREATE TABLE `BusinessHour` (
    `id` VARCHAR(191) NOT NULL,
    `business_id` VARCHAR(191) NOT NULL,
    `day` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `open_time` VARCHAR(191) NOT NULL,
    `close_time` VARCHAR(191) NOT NULL,
    `is_closed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `BusinessHour_business_id_idx`(`business_id`),
    UNIQUE INDEX `BusinessHour_business_id_day_key`(`business_id`, `day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BusinessHour` ADD CONSTRAINT `BusinessHour_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
