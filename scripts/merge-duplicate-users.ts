import { db } from "../server/db";
import { users, userAuthProviders } from "../shared/schema";
import { eq } from "drizzle-orm";

async function mergeDuplicateUsers() {
  console.log("Starting duplicate user merge process...");

  // Find all users with the email nachosaladrigas@gmail.com
  const duplicateUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, "nachosaladrigas@gmail.com"))
    .orderBy(users.createdAt);

  console.log(`Found ${duplicateUsers.length} users with email nachosaladrigas@gmail.com`);

  if (duplicateUsers.length <= 1) {
    console.log("No duplicates found, exiting...");
    return;
  }

  // Keep the oldest user (first created)
  const primaryUser = duplicateUsers[0];
  console.log(`Primary user (keeping): ID ${primaryUser.id}, created at ${primaryUser.createdAt}`);

  // Process each duplicate user
  for (let i = 1; i < duplicateUsers.length; i++) {
    const duplicateUser = duplicateUsers[i];
    console.log(`\nProcessing duplicate user: ID ${duplicateUser.id}, created at ${duplicateUser.createdAt}`);

    // First, link OAuth providers from duplicate to primary user
    // Since we don't have the provider info yet, we'll add them based on Supabase IDs
    try {
      // Add Google provider for primary user (if it's the Google account)
      if (i === 0 || primaryUser.id.includes("-")) { // Supabase IDs typically have dashes
        await db.insert(userAuthProviders).values({
          userId: primaryUser.id,
          provider: 'google',
          providerUserId: primaryUser.id,
          email: primaryUser.email!,
          linkedAt: primaryUser.createdAt || new Date(),
          lastUsedAt: new Date()
        }).onConflictDoNothing();
      }

      // Add LinkedIn provider from duplicate user
      await db.insert(userAuthProviders).values({
        userId: primaryUser.id,
        provider: 'linkedin_oidc',
        providerUserId: duplicateUser.id,
        email: duplicateUser.email!,
        linkedAt: duplicateUser.createdAt || new Date(),
        lastUsedAt: new Date()
      }).onConflictDoNothing();

      console.log(`Linked OAuth providers to primary user ${primaryUser.id}`);
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

  console.log("\nMerge process completed!");

  // Show final state
  const finalUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, "nachosaladrigas@gmail.com"));

  console.log(`\nFinal state: ${finalUsers.length} user(s) with email nachosaladrigas@gmail.com`);

  if (finalUsers.length > 0) {
    const authProviders = await db
      .select()
      .from(userAuthProviders)
      .where(eq(userAuthProviders.userId, finalUsers[0].id));

    console.log(`User ${finalUsers[0].id} has ${authProviders.length} OAuth providers linked:`);
    authProviders.forEach(provider => {
      console.log(`  - ${provider.provider} (ID: ${provider.providerUserId})`);
    });
  }
}

// Run the merge
mergeDuplicateUsers()
  .then(() => {
    console.log("\nScript completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nScript failed with error:", error);
    process.exit(1);
  });