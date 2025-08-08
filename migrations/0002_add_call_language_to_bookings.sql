ALTER TABLE "bookings" ADD COLUMN "call_language" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_call_language_languages_id_fk" FOREIGN KEY ("call_language") REFERENCES "languages"("id");--> statement-breakpoint
