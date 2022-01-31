import { Coerce, Type } from './Type'
import { InvalidCoercion } from './InvalidCoercion'

const coerce: Coerce<string, InvalidCoercion> = (value: any) => {
  if (typeof value !== 'string') {
    return new InvalidCoercion('string', value)
  }
  return value
}

export const string = new Type(coerce)
