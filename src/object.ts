import { Infer, Schema, Type } from './Type'
import { Expand } from './_typefunc'

export function object<O extends Record<string, Type<unknown>>>(obj: O): Type<SequenceObject<O>> {
  const object: Record<string, Schema> = {}
  for (const [key, type] of Object.entries(obj)) {
    object[key] = type.schema
  }

  return { schema: { object } }
}

type SequenceObject<O extends object> = Expand<
  InferObject<RemoveQuestionMarkFromKeys<SetKeysOptional<SetValuesOptional<O>>>>
>

type SetValuesOptional<O extends object> = { [K in keyof O]: K extends `${string}?` ? O[K] | undefined : O[K] }

// https://github.com/Microsoft/TypeScript/issues/25760#issuecomment-705137615
type SetKeysOptional<O extends object> = Omit<O, KeysEndingInQuestionMark<O>> & Partial<O>

type KeysEndingInQuestionMark<O extends object> = { [K in keyof O]: K extends `${any}?` ? K : never }[keyof O]

type RemoveQuestionMarkFromKeys<O extends object> = { [K in keyof O as K extends `${infer K2}?` ? K2 : K]: O[K] }

type InferObject<O extends object> = { [K in keyof O]: Infer<O[K]> }
