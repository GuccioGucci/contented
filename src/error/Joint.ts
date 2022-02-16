import { ContentedError } from './ContentedError'
import { HasAtKeyInvalidCoercion } from './AtKey'

const JOIN = Symbol()

export class Joint<E extends unknown[]> extends ContentedError {
  // @ts-ignore
  private readonly [JOIN]: true

  constructor(public readonly errors: E) {
    super()
  }

  static of<E, F>(err1: E, err2: F) {
    if (err1 instanceof Joint && err2 instanceof Joint) {
      return new Joint([...err1.errors, err2.errors])
    }
    if (err1 instanceof Joint) {
      return new Joint([...err1.errors, err2])
    }
    if (err2 instanceof Joint) {
      return new Joint([err1, ...err2.errors])
    }
    return new Joint([err1, err2])
  }
}

export type HasJointAtKey<E> = E extends Joint<infer U>
  ? Joint<MapAtKeyInvalidCoercion<U>>
  : never

type MapAtKeyInvalidCoercion<U> = U extends [infer Head, ...infer Tail]
  ? [HasAtKeyInvalidCoercion<Head, Head>, ...MapAtKeyInvalidCoercion<Tail>]
  : []
