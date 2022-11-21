import { ContentedError } from '../ContentedError'
import { InvalidCoercion } from '../InvalidCoercion'
import { MissingKey } from '../MissingKey'
import { scope } from '../_scope'
import {
  Type,
  PrimitiveSchema,
  isPrimitiveSchema,
  Schema,
  IsPrimitive,
  isMatchSchema,
  MatchSchema,
  ObjectSchema,
  IsObject,
} from './Type'

export function coerceTo<R>(type: Type<R>, value: any): R | Unexpected<R> {
  const { schema } = type
  return coerce(schema, value)
}

function coerce<R>(schema: Schema<R>, value: any): R | Unexpected<R> {
  if (isPrimitiveSchema(schema)) {
    return coercePrimitive(schema, value)
  }
  if (isMatchSchema(schema)) {
    return coerceMatch(schema, value)
  }
  return coerceObject(schema, value)
}

function coercePrimitive(schema: PrimitiveSchema, value: any) {
  return typeof value === schema ? value : new InvalidCoercion(schema, value)
}

function coerceMatch<R>(schema: MatchSchema<R>, value: any) {
  return schema.match === value ? value : new InvalidCoercion(`${schema.match}`, value)
}

function coerceObject(schema: ObjectSchema, value: any) {
  if (typeof value !== 'object') {
    return new InvalidCoercion('object', value)
  }

  const objectSchema = schema.object
  for (let [key, schemaAtKey] of Object.entries(objectSchema)) {
    const optional = key.endsWith('?')
    key = optional ? key.slice(0, -1) : key

    if (optional && !value.hasOwnProperty(key)) continue
    if (optional && value[key] === undefined) continue
    if (!optional && value[key] === undefined) return new MissingKey([key])

    const res = coerce(schemaAtKey, value[key])
    if (res instanceof ContentedError) {
      return scope([key], res)
    }
  }

  return value
}

type Unexpected<R> =
  | (IsPrimitive<R> extends true ? InvalidCoercion : never)
  | (IsObject<R> extends true ? { [K in keyof R]: Unexpected<R[K]> }[keyof R] : never)
  | InvalidCoercion // match
