import { ContentedError } from './ContentedError'

export class InvalidCoercion extends ContentedError {
  constructor(public readonly expected: string, public readonly got: any) {
    super()
  }
}
