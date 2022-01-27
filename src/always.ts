import { Type } from './Type'

export function always<T>(value: T): Type<T, never> {
  return new (class extends Type<T, never> {
    protected coerce(_: any): T {
      return value
    }
  })()
}
