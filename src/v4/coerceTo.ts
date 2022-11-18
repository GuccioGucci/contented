import { InvalidCoercion } from '../InvalidCoercion'
import { Type, Primitive, isPrimitive, Schema } from './Type'

export function coerceTo<E>(type: Type<E>, value: any): E | InvalidCoercion {
  const { schema } = type
  return coerce(schema, value) as E | InvalidCoercion
}

function coerce<E>(schema: Schema<E>, value: any) {
  if (isPrimitive(schema)) {
    return coercePrimitive(schema, value)
  }
  return schema.match === value ? value : new InvalidCoercion(`${schema.match}`, value)
}

function coercePrimitive(schema: Primitive, value: any) {
  return typeof value === schema ? value : new InvalidCoercion(schema, value)
}
