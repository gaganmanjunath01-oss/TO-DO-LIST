import { db } from './index.ts';
import { users, type UserRecord } from './schema.ts';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string | null
): Promise<UserRecord> {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName ?? null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName ?? null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to synchronize user record:', error);
    throw new Error('Failed to synchronize user account. Please try again.', {
      cause: error,
    });
  }
}
