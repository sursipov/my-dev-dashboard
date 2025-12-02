/*
  Warnings:

  - Made the column `name` on table `ProjectType` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProjectType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_ProjectType" ("id", "name") SELECT "id", "name" FROM "ProjectType";
DROP TABLE "ProjectType";
ALTER TABLE "new_ProjectType" RENAME TO "ProjectType";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
