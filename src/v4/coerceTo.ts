import { InvalidCoercion } from '../InvalidCoercion'
import { Type, Primitive, isPrimitive, Schema, IsPrimitive } from './Type'

export function coerceTo<R>(type: Type<R>, value: any): R | Unexpected<R> {
  const { schema } = type
  return coerce(schema, value) as R | Unexpected<R>
}

function coerce<R>(schema: Schema<R>, value: any) {
  if (isPrimitive(schema)) {
    return coercePrimitive(schema, value)
  }
  return schema.match === value ? value : new InvalidCoercion(`${schema.match}`, value)
}

function coercePrimitive(schema: Primitive, value: any) {
  return typeof value === schema ? value : new InvalidCoercion(schema, value)
}

type Unexpected<R> = (IsPrimitive<R> extends true ? InvalidCoercion : never) | InvalidCoercion // match
