import { ContentedError } from './ContentedError'

const JOIN = Symbol()

export class Joint<E extends unknown[]> extends ContentedError {
  // @ts-ignore
  private readonly [JOIN]: true

  constructor(public readonly errors: E) {
    super()
  }
}
