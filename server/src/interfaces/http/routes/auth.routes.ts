import { Hono } from 'hono'
import type { MiddlewareHandler } from 'hono'
import type { AuthController } from '../controllers/AuthController.js'
import type { AppEnv } from '../types.js'

export function createAuthRoutes(
  controller: AuthController,
  authMiddleware: MiddlewareHandler<AppEnv>,
): Hono<AppEnv> {
  const routes = new Hono<AppEnv>()

  routes.post('/register', (c) => controller.register(c))
  routes.post('/login', (c) => controller.login(c))
  routes.get('/me', authMiddleware, (c) => controller.me(c))

  return routes
}
