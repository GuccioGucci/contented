import { test } from 'uvu'
import assert from 'uvu/assert'
import { expectType } from 'ts-expect'
import { AtKey, InvalidCoercion, MissingKey, Joint, coerceTo } from './coercion'
import { number } from './number'
import { string } from './string'
import { arrayOf } from './arrayOf'
import { object } from './object'
import { oneOf } from './oneOf'

test(`array accepts array of the indicated element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, ['a', 'b', 'c'])

  assert.equal(res, ['a', 'b', 'c'])

  type R = string[] | InvalidCoercion | AtKey<InvalidCoercion>
  expectType<R>(res)
})

test(`array rejects values that are not arrays`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, 5)

  assert.equal(res, new InvalidCoercion('array', 5))

  type R = string[] | InvalidCoercion | AtKey<InvalidCoercion>
  expectType<R>(res)
})

test(`array rejects arrays of the wrong element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, [1, 2, 3])

  assert.equal(res, new AtKey([0], new InvalidCoercion('string', 1)))

  type R = string[] | InvalidCoercion | AtKey<InvalidCoercion>
  expectType<R>(res)
})

test(`array reports nested errors`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const res = coerceTo(arrayOfObjs, [{ a: 5 }])

  assert.equal(res, new AtKey([0, 'a'], new InvalidCoercion('string', 5)))

  type R = InvalidCoercion | AtKey<InvalidCoercion> | { a: string }[] | MissingKey
  expectType<R>(res)
})

test(`array rejects a value upon the first missing element`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const res = coerceTo(arrayOfObjs, [{ b: 0 }, { b: 1 }, { b: 2 }])

  assert.equal(res, new MissingKey([0, 'a']))

  type R = InvalidCoercion | AtKey<InvalidCoercion> | { a: string }[] | MissingKey
  expectType<R>(res)
})

test(`array accepts alternatives`, function () {
  const arrayOfAlternatives = arrayOf(oneOf(string, object({ a: number })))

  const res1 = coerceTo(arrayOfAlternatives, ['x', 'y', { a: 12 }])
  const res2 = coerceTo(arrayOfAlternatives, ['x', 'y', false])
  const res3 = coerceTo(arrayOfAlternatives, ['x', 'y', { a: 'hello' }])

  assert.equal(res1, ['x', 'y', { a: 12 }])
  assert.equal(
    res2,
    new Joint([
      new AtKey([2], new InvalidCoercion('string', false)),
      new AtKey([2], new InvalidCoercion('object', false)),
    ])
  )
  assert.equal(
    res3,
    new Joint([
      new AtKey([2], new InvalidCoercion('string', { a: 'hello' })),
      new AtKey([2, 'a'], new InvalidCoercion('number', 'hello')),
    ])
  )

  type R =
    | InvalidCoercion
    | (string | { a: number })[]
    | Joint<[AtKey<InvalidCoercion>, AtKey<InvalidCoercion> | MissingKey]>
  expectType<R>(res1)
  expectType<R>(res2)
  expectType<R>(res3)
})

test.run()
