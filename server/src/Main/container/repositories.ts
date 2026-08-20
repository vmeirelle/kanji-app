import { containerAdapter } from '../adapters/ContainerAdapter'
import UserRepository from '../../InterfaceAdapters/repository/UserRepository'
import RankingRepository from '../../InterfaceAdapters/repository/RankingRepository'

containerAdapter.register('UserRepository', UserRepository)
containerAdapter.register('RankingRepository', RankingRepository)
