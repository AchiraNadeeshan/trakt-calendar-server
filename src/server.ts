// src/server.ts
import Fastify from 'fastify'

const app = Fastify()

app.get('/', async () => {
  return { status: 'ok' }
})

app.listen({ port: 3000 }, () => {
  console.log('🚀 Server running on port 3000')
})
