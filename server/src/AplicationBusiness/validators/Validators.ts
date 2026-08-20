import { z } from 'zod'

export default {
  username: () =>
    z
      .string()
      .trim()
      .min(3)
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/),
  requiredString: () => z.string().trim().min(1),
  password: () => z.string().min(1).max(256),
  level: () => z.string().trim().min(1).max(16),
  intMin: (min = 0) => z.number().int().min(min),
  points: () => z.number().int().min(0).max(100000),
  optionalDay: () =>
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  optionalLevel: () => z.string().trim().min(1).max(16).optional(),
}
