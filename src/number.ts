import { As, InvalidCoercion } from './As'

class AsNumber extends As<number, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'number') {
      return new InvalidCoercion('number', value)
    }
    return value
  }
}

export const number: As<number, InvalidCoercion> = new AsNumber()
