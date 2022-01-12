export type Field = string | number | boolean | JsonObject | Location
export type Json =
  | string
  | number
  | boolean
  | null
  | undefined
  | Json[]
  | JsonObject
export type JsonObject = { [key: string]: Json }
export type Location = { lat: string; lon: string }

interface FieldAs<T> {
  from(field: Field): { value: T } | { error: FieldError }
}

class FieldAsString implements FieldAs<string> {
  from(field: Field) {
    if (typeof field !== 'string') {
      return { error: new FieldIsNot('string', field) }
    }
    return { value: field }
  }
}

class FieldAsBoolean implements FieldAs<boolean> {
  from(field: Field) {
    if (typeof field !== 'boolean') {
      return { error: new FieldIsNot('boolean', field) }
    }
    return { value: field }
  }
}

class FieldAsNumber implements FieldAs<number> {
  from(field: Field) {
    if (typeof field !== 'number') {
      return { error: new FieldIsNot('number', field) }
    }
    return { value: field }
  }
}

export const string: FieldAs<string> = new FieldAsString()
export const boolean: FieldAs<boolean> = new FieldAsBoolean()
export const number: FieldAs<number> = new FieldAsNumber()

type FieldError = FieldIsNot

export class FieldIsNot {
  constructor(
    public readonly expected:
      | 'string'
      | 'number'
      | 'boolean'
      | 'JSON object'
      | 'location',
    public readonly got: Field
  ) {}
}
