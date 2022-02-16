import { MissingKey } from './MissingKey'

export type HasMissingKey<E> = [MissingKey] extends [E] ? MissingKey : never
