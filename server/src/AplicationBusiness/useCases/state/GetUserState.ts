import { Err, Result } from 'ts-results'
import { injectable, inject } from 'tsyringe'
import {
  GetUserStateForm,
  IGetUserStateUseCase,
} from '../../../EnterpriseBusiness/useCases/state/GetUserStateUseCase'
import IUserRepository from '../../repository/IUserRepository'
import DatabaseError from '../../../EnterpriseBusiness/errors/DatabaseError'

@injectable()
export default class GetUserState implements IGetUserStateUseCase {
  constructor(@inject('UserRepository') readonly userRepository: IUserRepository) {}

  async execute(form: GetUserStateForm): Promise<Result<string | null, DatabaseError>> {
    const result = await this.userRepository.getState(form.userId)
    if (result.err) return Err(new DatabaseError())
    return result
  }
}
