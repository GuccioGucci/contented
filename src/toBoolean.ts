import { To } from './To'
import { InvalidCoercion } from './InvalidCoercion'

class ToBoolean extends To<boolean, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'boolean') {
      return new InvalidCoercion('boolean', value)
    }
    return value
  }
}

export const toBoolean: To<boolean, InvalidCoercion> = new ToBoolean()
