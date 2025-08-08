ALTER TABLE "user_languages" ADD COLUMN "is_primary" boolean DEFAULT false;

-- Migrate existing primary language data
INSERT INTO "user_languages" ("user_id", "language_id", "is_primary")
SELECT id, primary_language_id, true
FROM "users"
WHERE primary_language_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "user_languages" ul
  WHERE ul.user_id = users.id AND ul.language_id = users.primary_language_id
);

UPDATE "user_languages" ul
SET is_primary = true
FROM "users" u
WHERE ul.user_id = u.id AND ul.language_id = u.primary_language_id;

ALTER TABLE "users" DROP COLUMN IF EXISTS "primary_language_id";
