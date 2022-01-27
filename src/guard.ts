import { GuardName, InvalidCoercion } from './InvalidCoercion'
import { Type } from './Type'

export function satisfy<T>(guard: GuardFunction<T>): Type<T, InvalidCoercion> {
  return new (class extends Type<T, InvalidCoercion> {
    protected coerce(value: any) {
      if (guard(value)) {
        return value
      } else {
        return new InvalidCoercion(
          new GuardName(guard.name || guard.toString()),
          value
        )
      }
    }
  })()
}

type GuardFunction<T> = (x: any) => x is T
