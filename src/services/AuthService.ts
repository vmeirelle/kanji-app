import { httpClient, type HttpClient } from './HttpClient'
import { sha256Hex } from './crypto'

export type AuthUser = {
  id: number
  username: string
  createdAt: string
}

export type AuthResponse = {
  user: AuthUser
  token: string
}

export interface IAuthService {
  register(username: string, password: string): Promise<AuthResponse>
  login(username: string, password: string): Promise<AuthResponse>
  me(token: string): Promise<AuthUser>
}

class AuthService implements IAuthService {
  constructor(private readonly http: HttpClient) {}

  async register(username: string, password: string): Promise<AuthResponse> {
    const passwordHash = await sha256Hex(password)
    return this.http.post<AuthResponse>('/auth/register', { username, password: passwordHash })
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const passwordHash = await sha256Hex(password)
    return this.http.post<AuthResponse>('/auth/login', { username, password: passwordHash })
  }

  me(token: string): Promise<AuthUser> {
    return this.http.get<AuthUser>('/auth/me', token)
  }
}

export const authService: IAuthService = new AuthService(httpClient)
