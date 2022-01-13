import { As, InvalidCoercion } from './As'

class AsBoolean extends As<boolean, InvalidCoercion> {
  protected coerce(value: any) {
    if (typeof value !== 'boolean') {
      return new InvalidCoercion('boolean', value)
    }
    return value
  }
}

export const boolean: As<boolean, InvalidCoercion> = new AsBoolean()
