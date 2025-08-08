DO $$ BEGIN
    CREATE TYPE "host_verification_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "users"
  ALTER COLUMN "host_verification_status" TYPE host_verification_status USING (
    CASE
      WHEN "host_verification_status" IN ('verified') THEN 'APPROVED'
      WHEN "host_verification_status" IN ('rejected') THEN 'REJECTED'
      ELSE 'PENDING'
    END::host_verification_status
  ),
  ALTER COLUMN "host_verification_status" SET DEFAULT 'PENDING';
