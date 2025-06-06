/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Member` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_ownerId_fkey";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "ownerId",
ADD COLUMN     "deletedAt" TIMESTAMP(3);
