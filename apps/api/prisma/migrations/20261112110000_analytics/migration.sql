-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstSeenAt" TIMESTAMP(3),
ADD COLUMN     "signupChannel" TEXT,
ADD COLUMN     "signupLanding" TEXT,
ADD COLUMN     "signupRefHost" TEXT,
ADD COLUMN     "signupUtmCampaign" TEXT,
ADD COLUMN     "signupUtmMedium" TEXT,
ADD COLUMN     "signupUtmSource" TEXT;

-- CreateTable
CREATE TABLE "TrafficHit" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "host" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL DEFAULT 0,
    "ms" INTEGER NOT NULL DEFAULT 0,
    "country" TEXT,
    "refHost" TEXT,
    "kind" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "agent" TEXT,
    "verified" TEXT NOT NULL DEFAULT 'n/a',
    "visitor" TEXT NOT NULL,
    "ip" TEXT,
    "ua" TEXT NOT NULL,
    "beacon" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,

    CONSTRAINT "TrafficHit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrafficDaily" (
    "date" DATE NOT NULL,
    "host" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "requests" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TrafficDaily_pkey" PRIMARY KEY ("date","host","kind","class")
);

-- CreateTable
CREATE TABLE "TrafficCursor" (
    "id" TEXT NOT NULL,
    "inode" BIGINT NOT NULL,
    "offset" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrafficCursor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchDaily" (
    "engine" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "query" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL,
    "impressions" INTEGER NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SearchDaily_pkey" PRIMARY KEY ("engine","date","query","page")
);

-- CreateTable
CREATE TABLE "CollectorRun" (
    "id" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "detail" TEXT,
    "rows" INTEGER NOT NULL DEFAULT 0,
    "ranAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectorRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrafficHit_at_idx" ON "TrafficHit"("at");

-- CreateIndex
CREATE INDEX "TrafficHit_host_kind_at_idx" ON "TrafficHit"("host", "kind", "at");

-- CreateIndex
CREATE INDEX "TrafficHit_class_at_idx" ON "TrafficHit"("class", "at");

-- CreateIndex
CREATE INDEX "TrafficHit_visitor_at_idx" ON "TrafficHit"("visitor", "at");

-- CreateIndex
CREATE INDEX "SearchDaily_engine_date_idx" ON "SearchDaily"("engine", "date");
