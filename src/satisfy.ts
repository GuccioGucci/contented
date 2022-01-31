import { PredName, InvalidCoercion } from './InvalidCoercion'
import { Coerce, Type } from './Type'

export function satisfy<T>(pred: TypePredicate<T>): Type<T, InvalidCoercion> {
  const coerce: Coerce<T, InvalidCoercion> = (value: any) => {
    if (pred(value)) {
      return value
    } else {
      return new InvalidCoercion(
        new PredName(pred.name || pred.toString()),
        value
      )
    }
  }

  return new Type(coerce)
}

type TypePredicate<T> = (x: any) => x is T
