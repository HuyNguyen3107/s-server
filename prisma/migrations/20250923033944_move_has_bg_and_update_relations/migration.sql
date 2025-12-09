/*
  Warnings:

  - You are about to drop the column `product_variant_id` on the `backgrounds` table. All the data in the column will be lost.
  - You are about to drop the column `product_variant_id` on the `product_categories` table. All the data in the column will be lost.
  - You are about to drop the column `has_bg` on the `product_variants` table. All the data in the column will be lost.
  - Added the required column `product_id` to the `backgrounds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `product_categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."backgrounds" DROP CONSTRAINT "backgrounds_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_categories" DROP CONSTRAINT "product_categories_product_variant_id_fkey";

-- DropIndex
DROP INDEX "public"."idx_backgrounds_variant";

-- DropIndex
DROP INDEX "public"."idx_product_categories_variant";

-- AlterTable
ALTER TABLE "public"."backgrounds" DROP COLUMN "product_variant_id",
ADD COLUMN     "product_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."product_categories" DROP COLUMN "product_variant_id",
ADD COLUMN     "product_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."product_variants" DROP COLUMN "has_bg";

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "has_bg" BOOLEAN;

-- CreateIndex
CREATE INDEX "idx_backgrounds_product" ON "public"."backgrounds"("product_id");

-- CreateIndex
CREATE INDEX "idx_product_categories_product" ON "public"."product_categories"("product_id");

-- AddForeignKey
ALTER TABLE "public"."product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."backgrounds" ADD CONSTRAINT "backgrounds_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
