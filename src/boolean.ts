import { Type } from './Type'
import { InvalidCoercion } from './InvalidCoercion'

class BooleanType extends Type<boolean, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'boolean') {
      return new InvalidCoercion('boolean', value)
    }
    return value
  }
}

export const boolean: Type<boolean, InvalidCoercion> = new BooleanType()
