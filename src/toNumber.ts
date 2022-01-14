import { To, InvalidCoercion } from './To'

class ToNumber extends To<number, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'number') {
      return new InvalidCoercion('number', value)
    }
    return value
  }
}

export const toNumber: To<number, InvalidCoercion> = new ToNumber()
