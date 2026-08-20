import { containerAdapter } from '../adapters/ContainerAdapter'
import RegisterUser from '../../AplicationBusiness/useCases/auth/RegisterUser'
import LoginUser from '../../AplicationBusiness/useCases/auth/LoginUser'
import GetMe from '../../AplicationBusiness/useCases/auth/GetMe'
import SubmitScore from '../../AplicationBusiness/useCases/rankings/SubmitScore'
import ListRankings from '../../AplicationBusiness/useCases/rankings/ListRankings'
import GetUserState from '../../AplicationBusiness/useCases/state/GetUserState'
import SaveUserState from '../../AplicationBusiness/useCases/state/SaveUserState'

containerAdapter.register('RegisterUserUseCase', RegisterUser)
containerAdapter.register('LoginUserUseCase', LoginUser)
containerAdapter.register('GetMeUseCase', GetMe)
containerAdapter.register('SubmitScoreUseCase', SubmitScore)
containerAdapter.register('ListRankingsUseCase', ListRankings)
containerAdapter.register('GetUserStateUseCase', GetUserState)
containerAdapter.register('SaveUserStateUseCase', SaveUserState)
