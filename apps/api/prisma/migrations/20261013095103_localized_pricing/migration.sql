-- CreateEnum
CREATE TYPE "RenewalMode" AS ENUM ('AUTO', 'LINK');

-- AlterEnum
ALTER TYPE "PlanTier" ADD VALUE 'STARTER' BEFORE 'PRO';

-- AlterTable
ALTER TABLE "BillingPayment" ADD COLUMN     "cardCountry" TEXT,
ADD COLUMN     "creditCents" INTEGER,
ADD COLUMN     "isRenewal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "renewal" "RenewalMode" NOT NULL DEFAULT 'AUTO';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "billingCountry" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "renewal" "RenewalMode" NOT NULL DEFAULT 'AUTO';

-- Top-ups were always charged in USD, so the credit bought equals the amount charged.
UPDATE "BillingPayment" SET "creditCents" = "amountCents" WHERE "purpose" = 'CREDIT_TOPUP' AND "creditCents" IS NULL;

-- Free becomes a one-time allowance (period 'free'): posts an organization already scheduled count toward it.
INSERT INTO "UsageCounter" ("organizationId", "period", "metric", "used")
SELECT p."organizationId", 'free', 'posts', COUNT(*)::int
FROM "Post" p JOIN "Organization" o ON o."id" = p."organizationId"
WHERE o."tier" = 'FREE' AND p."status" <> 'DRAFT'
GROUP BY p."organizationId"
ON CONFLICT ("organizationId", "period", "metric") DO NOTHING;
