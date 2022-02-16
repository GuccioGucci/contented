import { ContentedError } from './ContentedError'
import { Path } from '../Path'

const AT_KEY = Symbol()

export class AtKey<E> extends ContentedError {
  // @ts-ignore
  private readonly [AT_KEY]: true

  constructor(public readonly at: Path, public readonly error: E) {
    super()
  }
}
