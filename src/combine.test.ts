import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerceTo } from './Type'
import { number } from './number'
import { string } from './string'
import { AtKey, InvalidCoercion } from './error/InvalidCoercion'
import { MissingKey } from './error/MissingKey'
import { at } from './at'
import { permissiveArrayOf } from './permissiveArrayOf'
import { combine } from './combine'

test(`combine accepts a function to mix-and-match other types`, function () {
  const id = combine((a, b) => `${a}-${b}`, at('a', string), at('b', number))

  const res = coerceTo(id, { a: 'hello', b: 12 })

  assert.is(res, 'hello-12')
})

test(`combine rejects the combination upon the first missing element`, function () {
  const id = combine((a, b) => `${a}-${b}`, at('a', string), at('b', number))

  const res = coerceTo(id, { b: 12 })

  assert.equal(res, new MissingKey(['a']))
})

test(`combine rejects the combination upon the first mismatching element`, function () {
  const id = combine((a, b) => `${a}-${b}`, at('a', string), at('b', number))

  const res = coerceTo(id, { a: 10, b: 12 })

  assert.equal(res, new AtKey(['a'], new InvalidCoercion('string', 10)))
})

test(`combine propagates non fatal errors`, function () {
  const permissiveLengths = combine(
    (xs) => xs.length,
    permissiveArrayOf(number)
  )

  const res1 = coerceTo(permissiveLengths, [1, 2, 3, 4, 5])
  const res2 = coerceTo(permissiveLengths, [1, 2, 3, 'hello', true])

  assert.equal(res1, 5)
  assert.equal(res2, [
    3,
    [
      new AtKey([3], new InvalidCoercion('number', 'hello')),
      new AtKey([4], new InvalidCoercion('number', true)),
    ],
  ])
})

test.run()
