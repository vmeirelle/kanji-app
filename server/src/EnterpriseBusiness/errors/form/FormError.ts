import TagError, { ErrorTag } from '../TagError'

export default class FormError extends TagError<{ [key: string]: string[] }> {
  tag: ErrorTag = 'FORM_ERROR'

  constructor(formErrors: { [key: string]: string[] }) {
    super('Form Validation Error')
    this.name = 'FormError'
    this.data = formErrors
  }
}
