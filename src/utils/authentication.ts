import { neon } from "@neondatabase/serverless";


export interface User {
    user_id: number;
    secret: string

    "access_token": string
    "expires_at": number
    "refresh_token": string

    trakt_uuid: string
}


export function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error("Missing DATABASE_URL")
    }

    const sql = neon(process.env.DATABASE_URL);

    return sql;
}


export async function getUser(id: number, secret: string): Promise<User | null> {

    const sql = getDb();

    const data = await sql`SELECT * FROM users WHERE
        user_id = ${id}
        AND secret = ${secret}
    ;`;

    if (data.length == 0) {
        return null;
    }

    if (data.length == 1) {
        return data[0] as User;
    }

    throw new Error("Unreachable, multiple ids")
}

export async function getAllUsers(): Promise<User[]> {

    const sql = getDb();

    const data = await sql`SELECT * FROM users;`;

    return data as User[]
}

export interface UserInfo {
    access_token: string, expires_at: Date, refresh_token: string
}

export async function addUser(secret: string, info: UserInfo, trakt_uuid: string): Promise<User> {

    const sql = getDb();

    const data = await sql`INSERT INTO users (secret, access_token, expires_at, refresh_token, trakt_uuid)
VALUES
    (${secret}, ${info.access_token}, ${info.expires_at}, ${info.refresh_token}, ${trakt_uuid})
RETURNING *;`;

    if (data.length != 1) {
        throw new Error("Error adding user")
    }

    return data[0] as User
}

export async function updateUser(user: User, info: UserInfo): Promise<User> {

    const sql = getDb();

    const data = await sql`UPDATE users
SET access_token = ${info.access_token},
    refresh_token = ${info.refresh_token},
    expires_at = ${info.expires_at}
WHERE   user_id = ${user.user_id}
RETURNING *;`;

    if (data.length != 1) {
        throw new Error("Error updating user")
    }

    return data[0] as User
}



export interface AuthState {
    state: string;
    code_verifier: string
}

export async function addAuthState(code_verifier: string): Promise<AuthState> {

    const sql = getDb();

    const data = await sql`INSERT INTO auth_state (code_verifier)
VALUES
    (${code_verifier})
RETURNING *;`;

    if (data.length != 1) {
        throw new Error("Error adding state")
    }

    return data[0] as AuthState
}



export async function getAuthState(state: string): Promise<AuthState | null> {

    const sql = getDb();

    const data = await sql`SELECT * FROM auth_state WHERE
        state = ${state}
    ;`;

    if (data.length == 0) {
        return null;
    }

    if (data.length == 1) {
        return data[0] as AuthState;
    }

    throw new Error("Unreachable, multiple states")
}


export async function deleteState(state: AuthState): Promise<void> {

    const sql = getDb();

    const _data = await sql`DELETE FROM auth_state WHERE
        state = ${state.state}
    ;`;



}


//TODO: maybe use neon auth
/* import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL,
    cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET,
        // sessionDataTtl: 300, // optional session_data cache TTL in seconds (default: 300)
    },
    // logLevel: 'silent', // disable Managed Better Auth logging
    // logLevel: 'debug',  // verbose proxy/upstream logging
});
 */
