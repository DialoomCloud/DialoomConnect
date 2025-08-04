import { db } from "../server/db";
import { users, userAuthProviders } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

async function findAndMergeAllDuplicates() {
  console.log("Starting search for duplicate users...");

  // Find all emails that have more than one user
  const duplicateEmails = await db
    .select({
      email: users.email,
      count: sql<number>`count(*)::int`
    })
    .from(users)
    .groupBy(users.email)
    .having(sql`count(*) > 1`);

  console.log(`Found ${duplicateEmails.length} emails with duplicate users`);

  if (duplicateEmails.length === 0) {
    console.log("No duplicate users found!");
    return;
  }

  // Process each duplicate email
  for (const { email, count } of duplicateEmails) {
    console.log(`\n\nProcessing duplicates for email: ${email} (${count} users)`);
    
    // Get all users with this email
    const duplicateUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email!))
      .orderBy(users.createdAt);

    // Keep the oldest user (first created)
    const primaryUser = duplicateUsers[0];
    console.log(`Primary user (keeping): ID ${primaryUser.id}, created at ${primaryUser.createdAt}`);

    // Process each duplicate user
    for (let i = 1; i < duplicateUsers.length; i++) {
      const duplicateUser = duplicateUsers[i];
      console.log(`\nProcessing duplicate user: ID ${duplicateUser.id}, created at ${duplicateUser.createdAt}`);

      try {
        // Determine provider based on Supabase ID pattern
        // Supabase OAuth IDs typically have UUID format with dashes
        const isOAuthUser = duplicateUser.id.includes("-");
        
        if (isOAuthUser) {
          // Try to determine provider from user metadata or ID
          // For now, we'll check if it's the second duplicate (likely LinkedIn)
          const provider = i === 1 && primaryUser.id.includes("-") ? 'linkedin_oidc' : 'google';
          
          await db.insert(userAuthProviders).values({
            userId: primaryUser.id,
            provider: provider as any,
            providerUserId: duplicateUser.id,
            email: duplicateUser.email!,
            linkedAt: duplicateUser.createdAt || new Date(),
            lastUsedAt: new Date()
          }).onConflictDoNothing();

          console.log(`Linked ${provider} provider to primary user ${primaryUser.id}`);
        }

        // If primary user doesn't have its own OAuth provider linked yet
        if (i === 1 && primaryUser.id.includes("-")) {
          await db.insert(userAuthProviders).values({
            userId: primaryUser.id,
            provider: 'google' as any,
            providerUserId: primaryUser.id,
            email: primaryUser.email!,
            linkedAt: primaryUser.createdAt || new Date(),
            lastUsedAt: new Date()
          }).onConflictDoNothing();
        }

      } catch (error) {
        console.error("Error linking OAuth providers:", error);
      }

      // Delete the duplicate user
      try {
        await db.delete(users).where(eq(users.id, duplicateUser.id));
        console.log(`Deleted duplicate user ${duplicateUser.id}`);
      } catch (error) {
        console.error(`Error deleting duplicate user ${duplicateUser.id}:`, error);
      }
    }
  }

  console.log("\n\nMerge process completed!");

  // Show final summary
  const finalDuplicates = await db
    .select({
      email: users.email,
      count: sql<number>`count(*)::int`
    })
    .from(users)
    .groupBy(users.email)
    .having(sql`count(*) > 1`);

  console.log(`\nFinal state: ${finalDuplicates.length} emails still have duplicate users`);

  // Show OAuth providers summary
  const usersWithProviders = await db
    .select({
      userId: userAuthProviders.userId,
      count: sql<number>`count(*)::int`
    })
    .from(userAuthProviders)
    .groupBy(userAuthProviders.userId);

  console.log(`\n${usersWithProviders.length} users have OAuth providers linked`);
}

// Run the merge
findAndMergeAllDuplicates()
  .then(() => {
    console.log("\nScript completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nScript failed with error:", error);
    process.exit(1);
  });