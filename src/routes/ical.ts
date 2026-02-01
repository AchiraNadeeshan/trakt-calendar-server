// src/routes/ical.ts
import { FastifyInstance } from 'fastify'
import { fetchTraktCalendar } from '../services/trakt'
import { generateCalendar } from '../utils/ical'

export default async function (app: FastifyInstance) {
  app.get('/v1/ical', async (req, reply) => {
    const { token, days = '30' } = req.query as any

    if (!token) {
      return reply.status(400).send('Missing token')
    }

    const d = Number(days)

    const [shows, movies] = await Promise.all([
      fetchTraktCalendar(token, 'shows', d),
      fetchTraktCalendar(token, 'movies', d),
    ])

    const ics = generateCalendar(shows, movies)

    reply
      .header('Content-Type', 'text/calendar')
      .send(ics)
  })
}
