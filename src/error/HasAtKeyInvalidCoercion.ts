import { InvalidCoercion } from './InvalidCoercion'
import { AtKey } from './AtKey'

export type HasAtKeyInvalidCoercion<E> = [InvalidCoercion] extends [E]
  ? AtKey<InvalidCoercion>
  : never
