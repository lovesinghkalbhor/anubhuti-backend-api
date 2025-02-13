-- CreateTable
CREATE TABLE `Donation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receiptNo` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `donorName` VARCHAR(191) NOT NULL,
    `aadhar` VARCHAR(191) NOT NULL,
    `pan` VARCHAR(191) NOT NULL,
    `phoneNumber` INTEGER NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `websiteDetails` VARCHAR(191) NOT NULL DEFAULT 'anubhuti.com',

    UNIQUE INDEX `Donation_receiptNo_key`(`receiptNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Donation` ADD CONSTRAINT `Donation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
