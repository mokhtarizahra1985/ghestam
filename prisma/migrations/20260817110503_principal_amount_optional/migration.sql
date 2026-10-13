-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "principalAmount" REAL,
    "installmentAmount" REAL NOT NULL,
    "installmentCount" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Loan" ("createdAt", "id", "installmentAmount", "installmentCount", "name", "principalAmount", "startDate") SELECT "createdAt", "id", "installmentAmount", "installmentCount", "name", "principalAmount", "startDate" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
