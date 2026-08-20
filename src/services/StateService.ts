import { httpClient, type HttpClient } from './HttpClient'

export interface IStateService {
  get(token: string): Promise<unknown | null>
  save(token: string, state: unknown): Promise<void>
}

class StateService implements IStateService {
  constructor(private readonly http: HttpClient) {}

  async get(token: string): Promise<unknown | null> {
    const result = await this.http.get<{ state: unknown }>('/me/state', token)
    return result.state ?? null
  }

  async save(token: string, state: unknown): Promise<void> {
    await this.http.put('/me/state', { state }, token)
  }
}

export const stateService: IStateService = new StateService(httpClient)
