// src/services/trakt.ts
import axios from 'axios'

const TRAKT_API = 'https://api.trakt.tv'

export async function fetchTraktCalendar(
  token: string,
  type: 'shows' | 'movies',
  days: number
) {
  const start = new Date().toISOString().split('T')[0]

  const res = await axios.get(
    `${TRAKT_API}/calendars/my/${type}/${start}/${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'trakt-api-key': process.env.TRAKT_CLIENT_ID!,
        'trakt-api-version': '2',
      },
    }
  )

  return res.data
}
