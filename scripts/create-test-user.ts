import { db } from "../server/db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";

async function createTestUser() {
  try {
    console.log("Creating test user...");
    
    // Hash the password
    const passwordHash = await bcrypt.hash("test2", 10);
    
    // Create the test user
    const [newUser] = await db.insert(users).values({
      id: crypto.randomUUID(),
      email: "billing@thopters.com",
      firstName: "test1",
      lastName: "dialoom",
      username: "test1dialoom",
      passwordHash,
      isAdmin: false,
      isHost: true, // Enable as host so they can receive video calls
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log("Test user created successfully:", {
      id: newUser.id,
      email: newUser.email,
      name: `${newUser.firstName} ${newUser.lastName}`,
      username: newUser.username
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating test user:", error);
    process.exit(1);
  }
}

createTestUser();