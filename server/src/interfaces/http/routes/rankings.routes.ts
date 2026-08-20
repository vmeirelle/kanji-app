import { Hono } from 'hono'
import type { MiddlewareHandler } from 'hono'
import type { RankingController } from '../controllers/RankingController.js'
import type { AppEnv } from '../types.js'

export function createRankingRoutes(
  controller: RankingController,
  authMiddleware: MiddlewareHandler<AppEnv>,
): Hono<AppEnv> {
  const routes = new Hono<AppEnv>()

  routes.get('/', (c) => controller.list(c))
  routes.post('/', authMiddleware, (c) => controller.submit(c))

  return routes
}
