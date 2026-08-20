import md5 from 'md5'
import { injectable } from 'tsyringe'
import { IHashAdapter } from '../../InterfaceAdapters/adapters/IHashAdapter'

@injectable()
export default class HashAdapter implements IHashAdapter {
  md5(text: string): string {
    return md5(text)
  }

  compareMd5(text: string, hashedText: string): boolean {
    return md5(text) === hashedText
  }
}
