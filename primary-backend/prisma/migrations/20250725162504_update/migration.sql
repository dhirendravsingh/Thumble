/*
  Warnings:

  - You are about to drop the column `presigned_url` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "presigned_url";
