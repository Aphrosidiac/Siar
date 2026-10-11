-- AlterTable
ALTER TABLE "BillingInvoice" ADD COLUMN     "billTo" JSONB,
ADD COLUMN     "lines" JSONB,
ADD COLUMN     "paymentMethod" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "billingName" TEXT,
ADD COLUMN     "billingTaxId" TEXT;
