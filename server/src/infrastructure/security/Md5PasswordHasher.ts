import { createHash } from 'node:crypto'
import type { PasswordHasher } from '../../application/ports/PasswordHasher.js'

export class Md5PasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return this.digest(plain)
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return this.digest(plain) === hash
  }

  private digest(value: string): string {
    return createHash('md5').update(value).digest('hex')
  }
}
