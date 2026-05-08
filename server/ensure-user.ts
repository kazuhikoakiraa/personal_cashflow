import { db } from "./db";

/**
 * Ensures a user exists in the database.
 * Called when a Supabase user first accesses the app.
 */
export async function ensureUserExists(userId: string, email: string, displayName?: string) {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      // Create new user
      await db.user.create({
        data: {
          id: userId,
          email,
          name: displayName || null,
        },
      });
      console.log(`Created user: ${userId}`);
    }
  } catch (err) {
    console.error("Failed to ensure user exists:", err);
    throw err;
  }
}
