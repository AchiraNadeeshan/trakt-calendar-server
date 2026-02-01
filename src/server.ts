// src/server.ts
import Fastify from 'fastify'
import icalRoute from './routes/ical'

const app = Fastify()

app.register(icalRoute)

app.listen({ port: 3000, host: '0.0.0.0' }, () => {
  console.log('🚀 Trakt Calendar Server running on port 3000')
})
