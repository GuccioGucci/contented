import { Type } from './Type'
import { InvalidCoercion } from './InvalidCoercion'

class StringType extends Type<string, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'string') {
      return new InvalidCoercion('string', value)
    }
    return value
  }
}

export const string: Type<string, InvalidCoercion> = new StringType()
