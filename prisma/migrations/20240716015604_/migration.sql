/*
  Warnings:

  - The values [black,blue,rose] on the enum `CaseColor` will be removed. If these variants are still used in the database, this will fail.
  - The values [smooth,textured] on the enum `CaseFinish` will be removed. If these variants are still used in the database, this will fail.
  - The values [silicone,polycarbonate] on the enum `CaseMaterial` will be removed. If these variants are still used in the database, this will fail.
  - The values [Canada,France] on the enum `Country` will be removed. If these variants are still used in the database, this will fail.
  - The values [fulfilled,shipped,awaiting_shipment] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [iphonex,iphone11,iphone12,iphone13,iphone14,iphone15] on the enum `PhoneModel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CaseColor_new" AS ENUM ('BLACK', 'BLUE', 'ROSE');
ALTER TABLE "Configuration" ALTER COLUMN "color" TYPE "CaseColor_new" USING ("color"::text::"CaseColor_new");
ALTER TYPE "CaseColor" RENAME TO "CaseColor_old";
ALTER TYPE "CaseColor_new" RENAME TO "CaseColor";
DROP TYPE "CaseColor_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CaseFinish_new" AS ENUM ('SMOOTH', 'TEXTURED');
ALTER TABLE "Configuration" ALTER COLUMN "finish" TYPE "CaseFinish_new" USING ("finish"::text::"CaseFinish_new");
ALTER TYPE "CaseFinish" RENAME TO "CaseFinish_old";
ALTER TYPE "CaseFinish_new" RENAME TO "CaseFinish";
DROP TYPE "CaseFinish_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CaseMaterial_new" AS ENUM ('SILICONE', 'POLYCARBONATE');
ALTER TABLE "Configuration" ALTER COLUMN "material" TYPE "CaseMaterial_new" USING ("material"::text::"CaseMaterial_new");
ALTER TYPE "CaseMaterial" RENAME TO "CaseMaterial_old";
ALTER TYPE "CaseMaterial_new" RENAME TO "CaseMaterial";
DROP TYPE "CaseMaterial_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Country_new" AS ENUM ('USA', 'CANADA', 'FRANCE');
ALTER TABLE "ShippingAddress" ALTER COLUMN "country" TYPE "Country_new" USING ("country"::text::"Country_new");
ALTER TABLE "BillingAddress" ALTER COLUMN "country" TYPE "Country_new" USING ("country"::text::"Country_new");
ALTER TYPE "Country" RENAME TO "Country_old";
ALTER TYPE "Country_new" RENAME TO "Country";
DROP TYPE "Country_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('AWAITING_SHIPMENT', 'SHIPPED', 'FULFILLED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'AWAITING_SHIPMENT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PhoneModel_new" AS ENUM ('IPHONE_X', 'IPHONE_11', 'IPHONE_12', 'IPHONE_13', 'IPHONE_14', 'IPHONE_15');
ALTER TABLE "Configuration" ALTER COLUMN "model" TYPE "PhoneModel_new" USING ("model"::text::"PhoneModel_new");
ALTER TYPE "PhoneModel" RENAME TO "PhoneModel_old";
ALTER TYPE "PhoneModel_new" RENAME TO "PhoneModel";
DROP TYPE "PhoneModel_old";
COMMIT;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'AWAITING_SHIPMENT';
