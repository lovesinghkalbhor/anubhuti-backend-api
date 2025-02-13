-- AlterTable
ALTER TABLE `donation` ADD COLUMN `donationCategory` VARCHAR(191) NOT NULL DEFAULT 'Other',
    ADD COLUMN `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'Unknown';

-- AlterTable
ALTER TABLE `item` ADD COLUMN `approxAmount` INTEGER NOT NULL DEFAULT 0;
