import { To } from './To'
import { InvalidCoercion } from './InvalidCoercion'

class ToBoolean extends To<boolean, InvalidCoercion> {
  protected coerceTo(value: any) {
    if (typeof value !== 'boolean') {
      return new InvalidCoercion('boolean', value)
    }
    return value
  }
}

export const boolean: To<boolean, InvalidCoercion> = new ToBoolean()
