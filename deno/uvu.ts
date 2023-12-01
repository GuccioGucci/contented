import { assertEquals } from 'https://deno.land/std@0.115.1/testing/asserts.ts'

type Test = typeof Deno.test & {
  run: () => void
}

;(Deno.test as Test).run = () => {}

export const test = Deno.test as Test
export const is = assertEquals
export const equal = assertEquals
