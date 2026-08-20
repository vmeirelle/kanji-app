export interface IContainerAdapter {
  registerValue<T>(token: string, value: T): void
  registerSingleton<T>(token: string, implementation: new (...args: any[]) => T): void
  register<T>(token: string, implementation: new (...args: any[]) => T): void
  registerFactory<T>(token: string, factory: () => T): void
  resolve<T>(token: string): T
  isRegistered(token: string): boolean
}
