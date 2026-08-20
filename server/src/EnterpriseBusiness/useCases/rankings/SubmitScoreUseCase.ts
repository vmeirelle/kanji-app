import UseCase from '../useCase'
import FormError from '../../errors/form/FormError'
import DatabaseError from '../../errors/DatabaseError'

export interface SubmitScoreForm {
  userId: number
  level: string
  correct: number
  total: number
  points: number
}

export interface SubmitScoreResult {
  id: number
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: Date
}

export type SubmitScoreErrors = FormError | DatabaseError

export type ISubmitScoreUseCase = UseCase<SubmitScoreForm, SubmitScoreResult, SubmitScoreErrors>
