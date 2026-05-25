-- CreateTable
CREATE TABLE `ServiceStaff` (
    `id` VARCHAR(191) NOT NULL,
    `service_id` VARCHAR(191) NOT NULL,
    `staff_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ServiceStaff_service_id_staff_id_key`(`service_id`, `staff_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServiceStaff` ADD CONSTRAINT `ServiceStaff_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceStaff` ADD CONSTRAINT `ServiceStaff_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
