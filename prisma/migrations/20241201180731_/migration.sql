/*
  Warnings:

  - You are about to drop the column `userId` on the `donation` table. All the data in the column will be lost.
  - Added the required column `authorizedPersonId` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `donation` DROP FOREIGN KEY `Donation_userId_fkey`;

-- AlterTable
ALTER TABLE `donation` DROP COLUMN `userId`,
    ADD COLUMN `authorizedPersonId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Donation` ADD CONSTRAINT `Donation_authorizedPersonId_fkey` FOREIGN KEY (`authorizedPersonId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
