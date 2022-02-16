import { Narrow } from './Narrow'
import { Type } from './Type'

export function always<T>(value: Narrow<T>): Type<T, never> {
  return new Type<T, never>((_: any) => value as T)
}
