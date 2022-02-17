import { Type } from './Type'
import { Narrow } from './_typefunc'

export function always<T>(value: Narrow<T>): Type<T, never> {
  return new Type<T, never>((_: any) => value as T)
}
