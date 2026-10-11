-- AlterTable
ALTER TABLE "User" ADD COLUMN "onboardedAt" TIMESTAMP(3);

-- Everyone already working in a team skips the welcome; owners still facing an empty organization get it.
UPDATE "User" u SET "onboardedAt" = now()
WHERE EXISTS (
  SELECT 1 FROM "OrganizationMember" m JOIN "Team" t ON t."organizationId" = m."organizationId" AND t."deletedAt" IS NULL
  WHERE m."userId" = u."id"
);
