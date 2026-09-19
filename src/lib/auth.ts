import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { cookies } from 'next/headers';
import { User, AuthSession } from '@/types';
import { getMongoCollection, isMongoConfigured } from './mongodb';

const pbkdf2Async = util.promisify(crypto.pbkdf2);

const COOKIE_NAME = 'watchtown_auth_token';
const SESSION_SECRET = process.env.SESSION_SECRET || (() => {
  console.warn('[SECURITY] SESSION_SECRET not set! Using random secret. Sessions will not persist across restarts.');
  return crypto.randomBytes(64).toString('hex');
})();
const ADMIN_REGISTRATION_SECRET = process.env.ADMIN_REGISTRATION_SECRET || (() => {
  const secret = crypto.randomBytes(32).toString('hex');
  console.warn(`[SECURITY] ADMIN_REGISTRATION_SECRET not set! Generated: ${secret}`);
  return secret;
})();
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Path to users database JSON file
const DB_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');

// Session revocation set
const revokedSessions = new Set<string>();

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = await pbkdf2Async(password, generatedSalt, 100000, 64, 'sha512');
  return { hash: derivedKey.toString('hex'), salt: generatedSalt };
}

async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const derivedKey = await pbkdf2Async(password, salt, 100000, 64, 'sha512');
  const computedHashBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
  const expectedHashBuffer = Buffer.from(hash, 'hex');
  
  if (computedHashBuffer.length !== expectedHashBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedHashBuffer, computedHashBuffer);
}

let mongoUsersSeeded = false;

async function getUsersCollection() {
  const col = await getMongoCollection<StoredUser>('users');
  if (!col) return null;

  if (!mongoUsersSeeded) {
    mongoUsersSeeded = true;
    try {
      const count = await col.countDocuments();
      if (count === 0) {
        console.log('[MongoDB] Seeding users collection...');
        if (fs.existsSync(USERS_FILE)) {
          const localUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) as StoredUser[];
          if (localUsers.length > 0) {
            const cleaned = localUsers.map((u) => {
              const copy = { ...u };
              delete (copy as any)._id;
              return copy;
            });
            await col.insertMany(cleaned as any);
            await col.createIndex({ email: 1 }, { unique: true });
            console.log(`[MongoDB] Successfully seeded ${localUsers.length} users!`);
            return col;
          }
        }

        // Generate initial default admin
        const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || crypto.randomBytes(12).toString('base64url');
        console.log(`[SECURITY] Generated WatchTown Administrator password: ${defaultPassword}`);
        const { hash, salt } = await hashPassword(defaultPassword);
        const defaultAdmin: StoredUser = {
          id: crypto.randomUUID(),
          name: 'WatchTown Administrator',
          email: 'admin@watchtown.in',
          role: 'admin',
          passwordHash: hash,
          salt,
          createdAt: new Date().toISOString(),
        };
        await col.insertOne(defaultAdmin as any);
        await col.createIndex({ email: 1 }, { unique: true });
        console.log('[MongoDB] Default administrator account created.');
      }
    } catch (err) {
      console.error('[MongoDB] Error seeding users:', err);
    }
  }

  return col;
}

async function readUsers(): Promise<StoredUser[]> {
  if (isMongoConfigured()) {
    const col = await getUsersCollection();
    if (col) {
      const docs = await col.find({}).toArray();
      return docs.map((d) => {
        const clean = { ...d };
        delete (clean as any)._id;
        return clean as StoredUser;
      });
    }
  }

  ensureDbDirectory();
  if (!fs.existsSync(USERS_FILE)) {
    // Seed default administrator
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || crypto.randomBytes(12).toString('base64url');
    console.log(`[SECURITY] Generated WatchTown Administrator password: ${defaultPassword}`);
    
    const { hash, salt } = await hashPassword(defaultPassword);
    const defaultAdmin: StoredUser = {
      id: crypto.randomUUID(),
      name: 'WatchTown Administrator',
      email: 'admin@watchtown.in',
      role: 'admin',
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify([defaultAdmin], null, 2), 'utf8');
    return [defaultAdmin];
  }

  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[], newUser?: StoredUser): Promise<void> {
  if (isMongoConfigured()) {
    const col = await getUsersCollection();
    if (col && newUser) {
      const clean = { ...newUser };
      delete (clean as any)._id;
      await col.insertOne(clean as any);
      return;
    }
  }

  ensureDbDirectory();
  const tmpFile = `${USERS_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(users, null, 2), 'utf8');
  fs.renameSync(tmpFile, USERS_FILE);
}

// Token creation using HMAC-SHA256
export function createSessionToken(session: AuthSession): string {
  const sessionWithJti = { ...session, jti: crypto.randomUUID() };
  const payload = Buffer.from(JSON.stringify(sessionWithJti)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): (AuthSession & { jti?: string }) | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf8');

    if (signatureBuffer.length !== expectedSignatureBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    if (Date.now() > session.expiresAt) {
      return null;
    }
    
    // Check revocation
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (revokedSessions.has(tokenHash)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Server authentication operations
export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const session = verifySessionToken(token);
    if (!session) return null;
    
    // Return without jti
    const { jti, ...authSession } = session as any;
    return authSession;
  } catch {
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<{ session: AuthSession; user: User } | { error: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();

  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  
  if (!user) {
    // Dummy verification to equalize timing
    await verifyPassword(password, crypto.randomBytes(64).toString('hex'), crypto.randomBytes(16).toString('hex'));
    return { error: 'Invalid email or password.' };
  }

  const isValid = await verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    return { error: 'Invalid email or password.' };
  }

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  const token = createSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });

  return {
    session,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
}

export async function checkUserExists(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();
  return users.some((u) => u.email.toLowerCase() === normalizedEmail);
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'customer' = 'customer',
  adminSecret?: string
): Promise<{ user: User; session: AuthSession } | { error: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { error: 'An account with this email already exists.' };
  }

  if (password.length < 8 || password.length > 128) {
    return { error: 'Password must be between 8 and 128 characters long.' };
  }

  // Determine role: if role requested is admin, check if no admins exist or adminSecret is provided
  let assignedRole: 'admin' | 'customer' = role;
  if (role === 'admin') {
    const adminExists = users.some((u) => u.role === 'admin');
    const secretMatches = adminSecret && adminSecret.trim() === ADMIN_REGISTRATION_SECRET;
    if (adminExists && !secretMatches) {
      return { error: 'Valid Admin Secret Key required to register an admin account.' };
    }
    assignedRole = 'admin';
  }

  const { hash, salt } = await hashPassword(password);
  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    role: assignedRole,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeUsers(users, newUser);

  const session: AuthSession = {
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  const token = createSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
    session,
  };
}

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    revokedSessions.add(tokenHash);
  }
  cookieStore.delete(COOKIE_NAME);
}

export function revokeAllUserSessions(): void {
  // Clear revoked in-memory on restart or manual flush
  revokedSessions.clear();
}
