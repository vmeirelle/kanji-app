import { Server } from 'http'
import { containerAdapter } from './Main/container'
import { HttpServer } from './InterfaceAdapters/gateway/http/HttpServer'
import HttpServerAdapter from './Main/adapters/HttpServerAdapter'
import AuthHttpApiController from './InterfaceAdapters/controllers/http/AuthHttpApiController'
import RankingHttpApiController from './InterfaceAdapters/controllers/http/RankingHttpApiController'
import ITokenService from './AplicationBusiness/services/ITokenService'
import { IRegisterUserUseCase } from './EnterpriseBusiness/useCases/auth/RegisterUserUseCase'
import { ILoginUserUseCase } from './EnterpriseBusiness/useCases/auth/LoginUserUseCase'
import { IGetMeUseCase } from './EnterpriseBusiness/useCases/auth/GetMeUseCase'
import { IListRankingsUseCase } from './EnterpriseBusiness/useCases/rankings/ListRankingsUseCase'
import { ISubmitScoreUseCase } from './EnterpriseBusiness/useCases/rankings/SubmitScoreUseCase'

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

  webserver.registerController(authController)
  webserver.registerController(rankingController)

  return webserver
}
