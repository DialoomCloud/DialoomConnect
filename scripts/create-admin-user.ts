import { db } from "../server/db";
import { users } from "../shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function createAdminUser() {
  try {
    console.log("Creating admin user...");
    
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.username, "dialoomroot"))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("Admin user already exists");
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash("TopGun", 10);

    // Create admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        id: "admin-001",
        email: "admin@dialoom.com",
        firstName: "Dialoom",
        lastName: "Administrator",
        username: "dialoomroot",
        passwordHash: passwordHash,
        isAdmin: true,
        isVerified: true,
        isActive: true,
        gdprConsent: true,
        gdprConsentDate: new Date(),
      })
      .returning();

    console.log("Admin user created successfully:", {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email
    });

  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

createAdminUser();