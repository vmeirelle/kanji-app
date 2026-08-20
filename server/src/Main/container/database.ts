import 'reflect-metadata'
import { DataSource } from 'typeorm'
import UserModel from '../../InterfaceAdapters/repository/models/main/UserModel'
import RankingModel from '../../InterfaceAdapters/repository/models/main/RankingModel'
import { containerAdapter } from '../adapters/ContainerAdapter'

const config = require('../../../env.config')

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  synchronize: config.environment !== 'production',
  logging: false,
  entities: [UserModel, RankingModel],
})

export async function initDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize()
  containerAdapter.registerValue('UserModel', AppDataSource.getRepository(UserModel))
  containerAdapter.registerValue('RankingModel', AppDataSource.getRepository(RankingModel))
}

export default AppDataSource
