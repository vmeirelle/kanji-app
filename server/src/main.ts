import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { loadEnv } from './infrastructure/config/env.js'
import { createPrismaClient } from './infrastructure/db/prisma.js'
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository.js'
import { PrismaRankingRepository } from './infrastructure/repositories/PrismaRankingRepository.js'
import { Md5PasswordHasher } from './infrastructure/security/Md5PasswordHasher.js'
import { JwtTokenService } from './infrastructure/security/JwtTokenService.js'
import { RegisterUser } from './application/use-cases/auth/RegisterUser.js'
import { LoginUser } from './application/use-cases/auth/LoginUser.js'
import { GetMe } from './application/use-cases/auth/GetMe.js'
import { SubmitScore } from './application/use-cases/rankings/SubmitScore.js'
import { ListRankings } from './application/use-cases/rankings/ListRankings.js'
import { HttpAuthController } from './interfaces/http/controllers/AuthController.js'
import { HttpRankingController } from './interfaces/http/controllers/RankingController.js'
import { createAuthMiddleware } from './interfaces/http/middleware/auth.js'
import { handleError } from './interfaces/http/middleware/error.js'
import { createAuthRoutes } from './interfaces/http/routes/auth.routes.js'
import { createRankingRoutes } from './interfaces/http/routes/rankings.routes.js'
import type { AppEnv } from './interfaces/http/types.js'

try {
  process.loadEnvFile()
} catch {
  void 0
}

const env = loadEnv()

const prisma = createPrismaClient()
const userRepository = new PrismaUserRepository(prisma)
const rankingRepository = new PrismaRankingRepository(prisma)

const passwordHasher = new Md5PasswordHasher()
const tokenService = new JwtTokenService({
  secret: env.JWT_SECRET,
  expiresInSeconds: env.JWT_EXPIRES_IN,
})

const registerUser = new RegisterUser(userRepository, passwordHasher, tokenService)
const loginUser = new LoginUser(userRepository, passwordHasher, tokenService)
const getMe = new GetMe(userRepository)
const submitScore = new SubmitScore(rankingRepository)
const listRankings = new ListRankings(rankingRepository)

const authController = new HttpAuthController(registerUser, loginUser, getMe)
const rankingController = new HttpRankingController(listRankings, submitScore)

const authMiddleware = createAuthMiddleware(tokenService)

const app = new Hono<AppEnv>()

app.use('*', cors({ origin: env.CORS_ORIGINS }))
app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/auth', createAuthRoutes(authController, authMiddleware))
app.route('/rankings', createRankingRoutes(rankingController, authMiddleware))
app.onError(handleError)

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`)
})
