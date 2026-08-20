import { Ok, Err, Result } from 'ts-results'
import { injectable, inject } from 'tsyringe'
import {
  ISaveUserStateUseCase,
  SaveUserStateForm,
} from '../../../EnterpriseBusiness/useCases/state/SaveUserStateUseCase'
import IUserRepository from '../../repository/IUserRepository'
import DatabaseError from '../../../EnterpriseBusiness/errors/DatabaseError'

@injectable()
export default class SaveUserState implements ISaveUserStateUseCase {
  constructor(@inject('UserRepository') readonly userRepository: IUserRepository) {}

  async execute(form: SaveUserStateForm): Promise<Result<void, DatabaseError>> {
    const result = await this.userRepository.saveState(form.userId, form.state)
    if (result.err) return Err(new DatabaseError())
    return Ok(undefined)
  }
}
