import { Server } from 'http'
import { containerAdapter } from './Main/container'
import { HttpServer } from './InterfaceAdapters/gateway/http/HttpServer'
import HttpServerAdapter from './Main/adapters/HttpServerAdapter'
import AuthHttpApiController from './InterfaceAdapters/controllers/http/AuthHttpApiController'
import RankingHttpApiController from './InterfaceAdapters/controllers/http/RankingHttpApiController'
import StateHttpApiController from './InterfaceAdapters/controllers/http/StateHttpApiController'
import HealthHttpApiController from './InterfaceAdapters/controllers/http/HealthHttpApiController'
import ITokenService from './AplicationBusiness/services/ITokenService'
import { IRegisterUserUseCase } from './EnterpriseBusiness/useCases/auth/RegisterUserUseCase'
import { ILoginUserUseCase } from './EnterpriseBusiness/useCases/auth/LoginUserUseCase'
import { IGetMeUseCase } from './EnterpriseBusiness/useCases/auth/GetMeUseCase'
import { IListRankingsUseCase } from './EnterpriseBusiness/useCases/rankings/ListRankingsUseCase'
import { ISubmitScoreUseCase } from './EnterpriseBusiness/useCases/rankings/SubmitScoreUseCase'
import { IGetUserStateUseCase } from './EnterpriseBusiness/useCases/state/GetUserStateUseCase'
import { ISaveUserStateUseCase } from './EnterpriseBusiness/useCases/state/SaveUserStateUseCase'

export default function startCleanArchitecture(httpServer: Server): HttpServer {
  const webserver = new HttpServer(new HttpServerAdapter(httpServer))

  const tokenService = containerAdapter.resolve<ITokenService>('TokenService')

  const authController = new AuthHttpApiController(
    containerAdapter.resolve<IRegisterUserUseCase>('RegisterUserUseCase'),
    containerAdapter.resolve<ILoginUserUseCase>('LoginUserUseCase'),
    containerAdapter.resolve<IGetMeUseCase>('GetMeUseCase'),
    tokenService,
  )

  const rankingController = new RankingHttpApiController(
    containerAdapter.resolve<IListRankingsUseCase>('ListRankingsUseCase'),
    containerAdapter.resolve<ISubmitScoreUseCase>('SubmitScoreUseCase'),
    tokenService,
  )

  const stateController = new StateHttpApiController(
    containerAdapter.resolve<IGetUserStateUseCase>('GetUserStateUseCase'),
    containerAdapter.resolve<ISaveUserStateUseCase>('SaveUserStateUseCase'),
    tokenService,
  )

  webserver.registerController(authController)
  webserver.registerController(rankingController)
  webserver.registerController(stateController)
  webserver.registerController(new HealthHttpApiController())

  return webserver
}
