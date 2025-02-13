/*
  Warnings:

  - You are about to alter the column `quantity` on the `item` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `item` MODIFY `quantity` INTEGER NOT NULL;
