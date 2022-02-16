import { ContentedError } from './ContentedError'

const INVALID_COERCION = Symbol()

export class InvalidCoercion extends ContentedError {
  // @ts-ignore
  private readonly [INVALID_COERCION]: true

  constructor(public readonly expected: string, public readonly got: any) {
    super()
  }
}
