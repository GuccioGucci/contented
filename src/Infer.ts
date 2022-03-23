import { ExpectedType, Type } from "./Type";

export type Infer<T> = [T] extends [Type<infer A, any>] ? ExpectedType<A> : never