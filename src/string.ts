import { To } from './To'
import { InvalidCoercion } from './InvalidCoercion'

class ToString extends To<string, InvalidCoercion> {
  protected coerceTo(value: any) {
    if (typeof value !== 'string') {
      return new InvalidCoercion('string', value)
    }
    return value
  }
}

export const string: To<string, InvalidCoercion> = new ToString()
