/*
  Warnings:

  - You are about to drop the column `access_token` on the `Sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `Sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `Sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Sessions_access_token_key";

-- AlterTable
ALTER TABLE "public"."Sessions" DROP COLUMN "access_token",
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sessions_token_key" ON "public"."Sessions"("token");
