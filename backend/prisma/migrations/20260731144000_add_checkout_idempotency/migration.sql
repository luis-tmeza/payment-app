ALTER TABLE "Transaction" ADD COLUMN "checkoutKey" TEXT;
CREATE UNIQUE INDEX "Transaction_checkoutKey_key" ON "Transaction"("checkoutKey");
