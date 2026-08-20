export interface IHashAdapter {
  md5(text: string): string
  compareMd5(text: string, hashedText: string): boolean
}
