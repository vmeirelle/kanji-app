import { z } from 'zod'

export const registerBodySchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(1).max(256),
})

export const loginBodySchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1).max(256),
})

export type RegisterBody = z.infer<typeof registerBodySchema>
export type LoginBody = z.infer<typeof loginBodySchema>

export type UserResponse = {
  id: string
  username: string
  createdAt: string
}

export type AuthResponse = {
  user: UserResponse
  token: string
}
