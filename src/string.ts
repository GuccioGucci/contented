import { As, InvalidCoercion } from './As'

class AsString extends As<string, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'string') {
      return new InvalidCoercion('string', value)
    }
    return value
  }
}

export const string: As<string, InvalidCoercion> = new AsString()
