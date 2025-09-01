/*
  Warnings:

  - Changed the column `role` on the `Users` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
-- First remove the old default
ALTER TABLE "public"."Users"
ALTER COLUMN "role" DROP DEFAULT;

-- Now change the type and wrap old values into arrays
ALTER TABLE "public"."Users"
ALTER COLUMN "role" SET DATA TYPE "public"."UserRole"[] USING ARRAY["role"];

-- Finally, set the new default
ALTER TABLE "public"."Users"
ALTER COLUMN "role" SET DEFAULT ARRAY['USER']::"public"."UserRole"[];
