import bcrypt from 'bcryptjs';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq, or } from 'drizzle-orm';

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(or(
        eq(users.username, 'dialoomroot'),
        eq(users.email, 'admin@dialoom.com')
      ))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('TopGun', saltRounds);

    // Create admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        email: 'admin@dialoom.com',
        username: 'dialoomroot',
        passwordHash,
        firstName: 'Dialoom',
        lastName: 'Administrator',
        isAdmin: true,
      })
      .returning();

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      username: adminUser.username,
      isAdmin: adminUser.isAdmin,
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();