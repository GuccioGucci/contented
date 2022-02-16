import { ContentedError } from './ContentedError'
import { Path } from '../Path'
import { InvalidCoercion } from './InvalidCoercion'

const AT_KEY = Symbol()

export class AtKey<E> extends ContentedError {
  // @ts-ignore
  private readonly [AT_KEY]: true

  constructor(public readonly at: Path, public readonly error: E) {
    super()
  }
}

export type HasAtKeyInvalidCoercion<E> = [InvalidCoercion] extends [E]
  ? AtKey<InvalidCoercion>
  : never
