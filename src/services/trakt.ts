// src/services/trakt.ts
import axios from 'axios'

const TRAKT_API = 'https://api.trakt.tv'

export async function fetchTraktCalendar(
  token: string,
  type: 'shows' | 'movies',
  days: number
) {
  const startDate = new Date().toISOString().split('T')[0]

  const response = await axios.get(
    `${TRAKT_API}/calendars/my/${type}/${startDate}/${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,  // manual token
        'trakt-api-key': process.env.TRAKT_CLIENT_ID as string,
        'trakt-api-version': '2',
      },
    }
  )

  return response.data
}
