import { To } from './To'
import { InvalidCoercion } from './InvalidCoercion'

class ToNumber extends To<number, InvalidCoercion> {
  protected coerceTo(value: any) {
    if (typeof value !== 'number') {
      return new InvalidCoercion('number', value)
    }
    return value
  }
}

export const number: To<number, InvalidCoercion> = new ToNumber()
