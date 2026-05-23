-- AlterTable
ALTER TABLE "Shot" ADD COLUMN     "isOB" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shotFeel" TEXT,
ADD COLUMN     "shotType" TEXT;
