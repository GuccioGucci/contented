import { test } from 'uvu'
import assert from 'uvu/assert'
import { Infer } from './Infer'
import { AtKey, InvalidCoercion } from './InvalidCoercion'
import { MissingKey } from './MissingKey'
import { number } from './number'
import { object } from './object'
import { optional } from './optional'
import { permissiveArrayOf } from './permissiveArrayOf'
import { string } from './string'
import { coerceTo } from './Type'

test(`object succeeds if the input data is an object adhering to the expectations`, function () {
  const xyObject = object({ x: string, y: number })

  const res = coerceTo(xyObject, { x: 'hello', y: 12 })

  assert.equal(res, { x: 'hello', y: 12 })
})

test(`object rejects the input data upon the first missing element`, function () {
  const xyObject = object({ x: string, y: number })

  const res = coerceTo(xyObject, { x: 'hello' })

  assert.equal(res, new MissingKey(['y']))
})

test(`object rejects the input data upon the first mismatching element`, function () {
  const xyObject = object({ x: string, y: number })

  const res = coerceTo(xyObject, { x: 'hello', y: false })

  assert.equal(res, new AtKey(['y'], new InvalidCoercion('number', false)))
})

test(`object propagates non fatal errors`, function () {
  const numbersAndStrings = object({ numbers: permissiveArrayOf(number), strings: permissiveArrayOf(string) })

  const res1 = coerceTo(numbersAndStrings, { numbers: [1, 2, 3], strings: ['a', 'b', 'c'] })
  const res2 = coerceTo(numbersAndStrings, { numbers: [1, 2, false], strings: ['a', 3, 'c'] })

  assert.equal(res1, { numbers: [1, 2, 3], strings: ['a', 'b', 'c'] })
  assert.equal(res2, [
    { numbers: [1, 2], strings: ['a', 'c'] },
    [
      new AtKey(['numbers', 2], new InvalidCoercion('number', false)),
      new AtKey(['strings', 1], new InvalidCoercion('string', 3)),
    ],
  ])
})

test(`object marks optional fields as optional`, function () {
  const obj = object({ x: optional(string), y: number })
  type ExpectedObj = Infer<typeof obj>

  const test: ExpectedObj = { y: 12 }

  assert.ok(test)
})
