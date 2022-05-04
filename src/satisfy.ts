import { Coerce, Type } from './Type'
import { InvalidCoercion } from './InvalidCoercion'

export function satisfy<T>(guard: (x: any) => x is T, name?: string) {
  type CoerceSatisfy = Coerce<T, InvalidCoercion>

  const coerce: CoerceSatisfy = (value: any) => {
    if (guard(value)) {
      return value
    }

    name = name || guard.name || guard.toString()
    return new InvalidCoercion(name, value)
  }

  return new Type(coerce)
}
