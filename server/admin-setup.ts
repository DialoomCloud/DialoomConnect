// Script to create admin user
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function createAdminUser() {
  try {
    const username = "dialoomroot";
    const password = "TopGun";
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Check if admin already exists
    const [existingAdmin] = await db.select().from(users).where(eq(users.username, username));
    
    if (existingAdmin) {
      console.log("Admin user already exists, updating password...");
      await db.update(users)
        .set({ 
          passwordHash,
          isAdmin: true,
          role: "admin",
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.username, username));
      console.log("Admin password updated successfully");
    } else {
      // Create admin user
      await db.insert(users).values({
        username,
        passwordHash,
        email: "admin@dialoom.com",
        firstName: "Admin",
        lastName: "Dialoom",
        isAdmin: true,
        role: "admin",
        isActive: true,
        isVerified: true,
      });
      console.log("Admin user created successfully");
    }
    
    console.log(`Admin credentials: username: ${username}, password: ${password}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
  process.exit(0);
}

createAdminUser();