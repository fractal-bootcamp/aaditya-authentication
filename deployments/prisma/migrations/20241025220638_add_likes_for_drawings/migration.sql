/*
  Warnings:

  - A unique constraint covering the columns `[postId,userId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[drawingId,userId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "unique_post_like" ON "Like"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_drawing_like" ON "Like"("drawingId", "userId");
