import { ContentedError } from './ContentedError'
import { Path } from './Path'

const INVALID_COERCION = Symbol()

export class InvalidCoercion extends ContentedError {
  // @ts-ignore
  private readonly [INVALID_COERCION]: true

  constructor(public readonly expected: string, public readonly got: any) {
    super()
  }
}

const AT_KEY = Symbol()

export class AtKey<E> extends ContentedError {
  // @ts-ignore
  private readonly [AT_KEY]: true

  constructor(public readonly atKey: Path, public readonly error: E) {
    super()
  }
}

export type HasAtKeyInvalidCoercion<E, F = never> = [InvalidCoercion] extends [E] ? AtKey<InvalidCoercion> : F
