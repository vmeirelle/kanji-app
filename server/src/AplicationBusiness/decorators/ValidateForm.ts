import { z, ZodTypeAny } from 'zod'
import { Err } from 'ts-results'
import FormError from '../../EnterpriseBusiness/errors/form/FormError'

type Shape = Record<string, ZodTypeAny>

function deepTrim(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) return value.map(deepTrim)
  if (value instanceof Date) return value
  if (typeof value === 'object') {
    const trimmed: Record<string, unknown> = {}
    for (const key of Object.keys(value as Record<string, unknown>)) {
      trimmed[key] = deepTrim((value as Record<string, unknown>)[key])
    }
    return trimmed
  }
  return value
}

export default function ValidateForm(shape: Shape) {
  const schema = z.object(shape)
  return (_target: object, _propertyKey: string, descriptor: PropertyDescriptor): void => {
    const original = descriptor.value as (form: unknown, ...args: unknown[]) => unknown
    if (!original) return
    descriptor.value = function (this: unknown, form: unknown, ...args: unknown[]): unknown {
      const trimmed = deepTrim(form)
      const result = schema.safeParse(trimmed)
      if (!result.success) {
        const errors: Record<string, string[]> = {}
        for (const issue of result.error.issues) {
          const key = issue.path.join('.') || '_'
          if (!errors[key]) errors[key] = []
          errors[key].push(issue.message)
        }
        return Err(new FormError(errors))
      }
      return original.call(this, trimmed, ...args)
    }
  }
}
