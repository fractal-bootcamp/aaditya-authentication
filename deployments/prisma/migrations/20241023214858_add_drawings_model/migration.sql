-- CreateTable
CREATE TABLE "Drawing" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "drawing" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drawing_pkey" PRIMARY KEY ("id")
);
