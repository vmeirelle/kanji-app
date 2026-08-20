import { Ok, Err, Result } from 'ts-results'
import { injectable, inject } from 'tsyringe'
import {
  GetMeErrors,
  GetMeForm,
  IGetMeUseCase,
  PublicUser,
} from '../../../EnterpriseBusiness/useCases/auth/GetMeUseCase'
import IUserRepository from '../../repository/IUserRepository'
import DatabaseError from '../../../EnterpriseBusiness/errors/DatabaseError'
import NotFoundError from '../../../EnterpriseBusiness/errors/NotFoundError'

@injectable()
export default class GetMe implements IGetMeUseCase {
  constructor(@inject('UserRepository') readonly userRepository: IUserRepository) {}

  async execute(form: GetMeForm): Promise<Result<PublicUser, GetMeErrors>> {
    const found = await this.userRepository.findById(form.userId)
    if (found.err) return Err(new DatabaseError())
    if (!found.val) return Err(new NotFoundError('User'))

    const user = found.val
    return Ok({ id: user.id, username: user.username, createdAt: user.createdAt })
  }
}
