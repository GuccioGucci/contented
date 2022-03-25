import { test } from 'uvu'
import assert from 'uvu/assert'
import { at } from './at'
import { combineIntoObject } from './combineIntoObject'
import { Infer } from './Infer'
import { AtKey, InvalidCoercion } from './InvalidCoercion'
import { MissingKey } from './MissingKey'
import { number } from './number'
import { optional } from './optional'
import { permissiveArrayOf } from './permissiveArrayOf'
import { string } from './string'
import { coerceTo } from './Type'

test(`combineIntoObject assembles object types from other types`, function () {
  const res1 = coerceTo(combineIntoObject({ a: string }), 'hello')
  const res2 = coerceTo(combineIntoObject({ a: string, b: string }), 'hello')

  assert.equal(res1, { a: 'hello' })
  assert.equal(res2, { a: 'hello', b: 'hello' })
})

test(`combineIntoObject rejects the combination upon the first missing element`, function () {
  const xyObject = combineIntoObject({ x: at('a', string), y: at('b', number) })

  const res = coerceTo(xyObject, { b: 12 })

  assert.equal(res, new MissingKey(['a']))
})

test(`combineIntoObject rejects the combination upon the first mismatching element`, function () {
  const xyObject = combineIntoObject({ x: at('a', string), y: at('b', number) })

  const res = coerceTo(xyObject, { a: 10, b: 12 })

  assert.equal(res, new AtKey(['a'], new InvalidCoercion('string', 10)))
})

test(`combineIntoObject propagates non fatal errors`, function () {
  const valuesObj = combineIntoObject({ values: permissiveArrayOf(number) })

  const res1 = coerceTo(valuesObj, [1, 2, 3, 4, 5])
  const res2 = coerceTo(valuesObj, [1, 2, 3, 'hello', true])

  assert.equal(res1, { values: [1, 2, 3, 4, 5] })
  assert.equal(res2, [
    { values: [1, 2, 3] },
    [new AtKey([3], new InvalidCoercion('number', 'hello')), new AtKey([4], new InvalidCoercion('number', true))],
  ])
})

test(`combineIntoObject marks optional fields as optional`, function () {
  const obj = combineIntoObject({ x: at('a', optional(string)), y: at('b', number) })
  type ExpectedObj = Infer<typeof obj>

  const test: ExpectedObj = { y: 12 }

  assert.ok(test)
})

test.run()
