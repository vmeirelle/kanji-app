export default interface IHashService {
  hashPassword(text: string): string
  comparePassword(text: string, hashedText: string): boolean
}
