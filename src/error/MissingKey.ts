import { ContentedError } from './ContentedError'
import { Path } from '../Path'

const MISSING_KEY = Symbol()

export class MissingKey extends ContentedError {
  // @ts-ignore
  private readonly [MISSING_KEY]: true

  constructor(public readonly missingKey: Path) {
    super()
  }
}
