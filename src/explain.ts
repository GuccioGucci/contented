import { CoercionError, InvalidType } from './coercion'
import { isPrimitiveSchema, PrimitiveSchema, Schema, Type } from './Type'

export function explain<R>(type: Type<R>, value: any): WhyValueIsNot<R> | undefined {
  const { schema } = type
  return explainSchema(schema, value)
}

function explainSchema(schema: Schema, value: any): any {
  if (isPrimitiveSchema(schema)) {
    return explainPrimitive(schema, value)
  }
  throw new Error(`Not yet implemented: ${schema} against ${value}`)
}

function explainPrimitive(schema: PrimitiveSchema, value: any): any {
  if (typeof value === schema) {
    return undefined
  }
  return {
    value,
    not: schema,
    cause: [new InvalidType(schema, value)],
  }
}

interface WhyValueIsNot<_R> {
  value: any
  not: Not
  cause: CoercionError[]
}

type Not = Schema
