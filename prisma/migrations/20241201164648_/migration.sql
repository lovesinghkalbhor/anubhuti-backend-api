/*
  Warnings:

  - Made the column `receiptNo` on table `donation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `donation` MODIFY `receiptNo` INTEGER NOT NULL;
