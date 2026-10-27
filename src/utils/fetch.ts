import { fetchTraktCalendar, refreshAccessToken, type Movie, type Show } from "../services/trakt";
import { updateUser, type User } from "./authentication";
import { addNewEntries } from "./blob";
import { fixDate } from "./date";

async function refreshUserToken(user: User): Promise<User> {

    const redirect_url = `https://${process.env.HOSTNAME}/api/v2/auth/callback`

    const result = await refreshAccessToken(user.refresh_token, redirect_url)

    const expires_at = new Date(fixDate(result.expires_at))

    //NOTE: normal APIs don't update the refresh token, but this APi also updates the refresh_token, so we need to update that token too
    return await updateUser(user, { access_token: result.access_token, refresh_token: result.refresh_token, expires_at })

}

async function getCurrentToken(user: User, force_token_refresh: boolean): Promise<string> {

    const now = new Date()

    if (force_token_refresh || now.getTime() > user.expires_at) {
        const newUser = await refreshUserToken(user)
        return newUser.access_token
    }

    return user.access_token;
}

export interface DataEntry {
    shows: number,
    movies: number
}

export async function refreshDataForUser(user: User, days: number, force_token_refresh: boolean = false): Promise<DataEntry> {

    const token = await getCurrentToken(user, force_token_refresh)

    const entries: [Show[], Movie[]] = await Promise.all([
        fetchTraktCalendar(token, 'shows', days),
        fetchTraktCalendar(token, 'movies', days),
    ])

    const [shows, movies] = await addNewEntries(user, entries)

    return { shows, movies }
}
