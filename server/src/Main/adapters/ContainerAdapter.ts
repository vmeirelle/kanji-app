import 'reflect-metadata'
import { container, DependencyContainer } from 'tsyringe'
import { IContainerAdapter } from '../../InterfaceAdapters/adapters/IContainerAdapter'

export default class ContainerAdapter implements IContainerAdapter {
  private containerInstance: DependencyContainer

  constructor(containerInstance?: DependencyContainer) {
    this.containerInstance = containerInstance || container
  }

  registerValue<T>(token: string, value: T): void {
    this.containerInstance.register(token, { useValue: value })
  }

  registerSingleton<T>(token: string, implementation: new (...args: any[]) => T): void {
    this.containerInstance.registerSingleton(token, implementation)
  }

  register<T>(token: string, implementation: new (...args: any[]) => T): void {
    this.containerInstance.register(token, { useClass: implementation })
  }

  registerFactory<T>(token: string, factory: () => T): void {
    this.containerInstance.register(token, { useFactory: factory })
  }

  resolve<T>(token: string): T {
    return this.containerInstance.resolve<T>(token)
  }

  isRegistered(token: string): boolean {
    return this.containerInstance.isRegistered(token)
  }
}

export const containerAdapter = new ContainerAdapter()
