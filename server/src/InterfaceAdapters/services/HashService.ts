import { injectable, inject } from 'tsyringe'
import IHashService from '../../AplicationBusiness/services/IHashService'
import { IHashAdapter } from '../adapters/IHashAdapter'

@injectable()
export default class HashService implements IHashService {
  constructor(@inject('HashAdapter') readonly hashAdapter: IHashAdapter) {}

  hashPassword(text: string): string {
    return this.hashAdapter.md5(text)
  }

  comparePassword(text: string, hashedText: string): boolean {
    return this.hashAdapter.compareMd5(text, hashedText)
  }
}
