import { Coerce, Type } from './Type'
import { InvalidCoercion } from './error/InvalidCoercion'

const coerce: Coerce<number, InvalidCoercion> = (value: any) => {
  if (typeof value !== 'number') {
    return new InvalidCoercion('number', value)
  }
  return value
}

export const number = new Type(coerce)
