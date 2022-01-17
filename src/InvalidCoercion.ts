import { ContentedError } from './ContentedError'

export class InvalidCoercion extends ContentedError {
  constructor(public readonly expected: Expected, public readonly got: any) {
    super()
  }
}

type Expected = 'string' | 'number' | 'boolean' | 'array'
