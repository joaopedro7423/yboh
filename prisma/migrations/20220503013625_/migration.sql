-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobArea" TEXT NOT NULL,
    "cratedAts" TEXT,
    "deletedAts" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
