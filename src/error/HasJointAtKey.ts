import { InvalidCoercion } from './InvalidCoercion'
import { AtKey } from './AtKey'
import { Joint } from './Joint'

export type HasJointAtKey<E> = E extends Joint<infer U>
  ? Joint<MapAtKeyInvalidCoercion<U>>
  : never

type MapAtKeyInvalidCoercion<U> = U extends [infer Head, ...infer Tail]
  ? [ApplyAtKeyInvalidCoercion<Head>, ...MapAtKeyInvalidCoercion<Tail>]
  : []

type ApplyAtKeyInvalidCoercion<E> = [InvalidCoercion] extends [E]
  ? AtKey<InvalidCoercion>
  : E
