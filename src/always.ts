import { Type } from './Type'

export function always<T>(value: T): Type<T, never> {
  return new Type<T, never>((_: any) => value)
}
