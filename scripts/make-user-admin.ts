import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function makeUserAdmin() {
  try {
    console.log("Updating user to admin...");
    
    // Find user by email
    const userEmail = "nachosaladrigas@gmail.com"; // Your current user email
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail));
      
    if (!user) {
      console.log("User not found!");
      return;
    }
    
    // Update user to be admin
    const [updatedUser] = await db
      .update(users)
      .set({ 
        isAdmin: true,
        isVerified: true 
      })
      .where(eq(users.email, userEmail))
      .returning();
      
    console.log("User updated to admin:", {
      id: updatedUser.id,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin
    });
    
  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    process.exit(0);
  }
}

makeUserAdmin();
