import { Type } from './Type'
import { InvalidCoercion } from './InvalidCoercion'

class NumberType extends Type<number, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'number') {
      return new InvalidCoercion('number', value)
    }
    return value
  }
}

export const number: Type<number, InvalidCoercion> = new NumberType()
