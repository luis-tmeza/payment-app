CREATE TABLE "TransactionItem" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "totalAmountCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TransactionItem_transactionId_idx" ON "TransactionItem"("transactionId");
CREATE INDEX "TransactionItem_productId_idx" ON "TransactionItem"("productId");
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
