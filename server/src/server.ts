import 'reflect-metadata'
import 'dotenv/config'
import http from 'http'
import express from 'express'
import { initDatabase } from './Main/container/database'
import './Main/container'
import startCleanArchitecture from './main'

const config = require('../env.config')

async function bootstrap(): Promise<void> {
  await initDatabase()

  const httpServer = http.createServer()
  const webserver = startCleanArchitecture(httpServer)

  const fallback = express()
  fallback.use((_req, res) => {
    res.status(404).json({ message: 'Not Found' })
  })

  httpServer.on('request', async (req, res) => {
    const handled = await webserver.onRequest(req, res)
    if (!handled.found) fallback(req, res)
  })

  httpServer.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`)
  })

  process.on('SIGINT', () => httpServer.close(() => process.exit(0)))
  process.on('SIGTERM', () => httpServer.close(() => process.exit(0)))
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error)
  process.exit(1)
})
