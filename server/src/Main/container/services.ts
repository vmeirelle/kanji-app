import { containerAdapter } from '../adapters/ContainerAdapter'
import HashAdapter from '../adapters/HashAdapter'
import JwtAdapter from '../adapters/JwtAdapter'
import HashService from '../../InterfaceAdapters/services/HashService'
import TokenService from '../../InterfaceAdapters/services/TokenService'

const config = require('../../../env.config')

containerAdapter.registerSingleton('HashAdapter', HashAdapter)
containerAdapter.registerFactory(
  'TokenAdapter',
  () => new JwtAdapter(config.jwt.secret, 'HS256', config.jwt.expirationSeconds),
)
containerAdapter.register('HashService', HashService)
containerAdapter.register('TokenService', TokenService)
