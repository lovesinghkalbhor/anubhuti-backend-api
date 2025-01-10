/*
  Warnings:

  - You are about to drop the column `userId` on the `donation` table. All the data in the column will be lost.
  - Added the required column `authorizedPersonId` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorizedPersonName` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `donation` DROP FOREIGN KEY `Donation_userId_fkey`;

-- AlterTable
ALTER TABLE `donation` DROP COLUMN `userId`,
    ADD COLUMN `authorizedPersonId` INTEGER NOT NULL,
    ADD COLUMN `authorizedPersonName` VARCHAR(191) NOT NULL,
    MODIFY `receiptNo` INTEGER NULL,
    MODIFY `aadhar` VARCHAR(191) NULL,
    MODIFY `pan` VARCHAR(191) NULL,
    MODIFY `phoneNumber` VARCHAR(191) NOT NULL,
    MODIFY `amount` INTEGER NULL;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `donationId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Donation` ADD CONSTRAINT `Donation_authorizedPersonId_fkey` FOREIGN KEY (`authorizedPersonId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_donationId_fkey` FOREIGN KEY (`donationId`) REFERENCES `Donation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
