import { To } from './To'
import { InvalidCoercion } from './InvalidCoercion'

class ToNumber extends To<number, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'number') {
      return new InvalidCoercion('number', value)
    }
    return value
  }
}

export const toNumber: To<number, InvalidCoercion> = new ToNumber()
