import { PredName, InvalidCoercion } from './InvalidCoercion'
import { Type } from './Type'

export function satisfy<T>(pred: TypePredicate<T>): Type<T, InvalidCoercion> {
  return new (class extends Type<T, InvalidCoercion> {
    protected coerce(value: any) {
      if (pred(value)) {
        return value
      } else {
        return new InvalidCoercion(
          new PredName(pred.name || pred.toString()),
          value
        )
      }
    }
  })()
}

type TypePredicate<T> = (x: any) => x is T
