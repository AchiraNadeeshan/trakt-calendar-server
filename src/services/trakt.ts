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

export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await axios.post(`${TRAKT_API}/oauth/token`, {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
  })

  return response.data.access_token
}
