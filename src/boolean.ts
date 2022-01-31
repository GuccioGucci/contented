import { Coerce, Type } from './Type'
import { InvalidCoercion } from './InvalidCoercion'

const coerce: Coerce<boolean, InvalidCoercion> = (value: any) => {
  if (typeof value !== 'boolean') {
    return new InvalidCoercion('boolean', value)
  }
  return value
}

export const boolean = new Type(coerce)
