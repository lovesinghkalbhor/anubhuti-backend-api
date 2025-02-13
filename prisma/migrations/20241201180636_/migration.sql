/*
  Warnings:

  - You are about to drop the column `authorizedPersonId` on the `donation` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `donation` DROP FOREIGN KEY `Donation_authorizedPersonId_fkey`;

-- AlterTable
ALTER TABLE `donation` DROP COLUMN `authorizedPersonId`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `item` MODIFY `quantity` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Donation` ADD CONSTRAINT `Donation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
