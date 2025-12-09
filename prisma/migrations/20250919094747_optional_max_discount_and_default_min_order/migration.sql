-- AlterTable
ALTER TABLE "public"."promotions" ALTER COLUMN "min_order_value" SET DEFAULT 0,
ALTER COLUMN "max_discount_amount" DROP NOT NULL;
