// @ts-ignore so that we can decleare Type<E> a phantom type, instead of Type<_E>
// Type<E> is an interface because the user need not know what constitues a Type<E> (IntelliSense does not expand interfaces)
export interface Type<E> {
  to: To
}

export type To = 'string' | 'number' | 'boolean'

export const string: Type<string> = { to: 'string' }

export const number: Type<number> = { to: 'number' }

export const boolean: Type<boolean> = { to: 'boolean' }
