// api/ical.ts
import { fetchTraktCalendar } from '../../src/services/trakt'
import { generateCalendar } from '../../src/utils/ical'

export default async function handler(req: any, res: any) {
  try {
    const { token, days = '30' } = req.query

    if (!token || typeof token !== 'string') {
      return res.status(400).send('Missing or invalid token')
    }

    const numDays = Number(days)
    if (Number.isNaN(numDays) || numDays <= 0) {
      return res.status(400).send('Invalid days parameter')
    }

    const [shows, movies] = await Promise.all([
      fetchTraktCalendar(token, 'shows', numDays),
      fetchTraktCalendar(token, 'movies', numDays),
    ])

    const ics = generateCalendar(shows, movies)

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600')

    return res.status(200).send(ics)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Internal Server Error')
  }
}
