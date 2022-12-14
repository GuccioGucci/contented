import { test } from 'uvu'
import assert from 'uvu/assert'
import { expectType } from 'ts-expect'
import { AtKey, InvalidType, MissingKey, Joint, coerceTo } from './coercion'
import { number } from './number'
import { string } from './string'
import { arrayOf } from './arrayOf'
import { object } from './object'
import { oneOf } from './oneOf'

test(`array accepts array of the indicated element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, ['a', 'b', 'c'])

  assert.equal(res, ['a', 'b', 'c'])

  type R = string[] | InvalidType | AtKey<InvalidType>
  expectType<R>(res)
})

test(`array rejects values that are not arrays`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, 5)

  assert.equal(res, new InvalidType('array', 5))

  type R = string[] | InvalidType | AtKey<InvalidType>
  expectType<R>(res)
})

test(`array rejects arrays of the wrong element type`, function () {
  const arrayOfStrings = arrayOf(string)

  const res = coerceTo(arrayOfStrings, [1, 2, 3])

  assert.equal(res, new AtKey([0], new InvalidType('string', 1)))

  type R = string[] | InvalidType | AtKey<InvalidType>
  expectType<R>(res)
})

test(`array reports nested errors`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const res = coerceTo(arrayOfObjs, [{ a: 5 }])

  assert.equal(res, new AtKey([0, 'a'], new InvalidType('string', 5)))

  type R = InvalidType | AtKey<InvalidType> | { a: string }[] | MissingKey
  expectType<R>(res)
})

test(`array rejects a value upon the first missing element`, function () {
  const arrayOfObjs = arrayOf(object({ a: string }))

  const res = coerceTo(arrayOfObjs, [{ b: 0 }, { b: 1 }, { b: 2 }])

  assert.equal(res, new MissingKey([0, 'a']))

  type R = InvalidType | AtKey<InvalidType> | { a: string }[] | MissingKey
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
    new Joint([new AtKey([2], new InvalidType('string', false)), new AtKey([2], new InvalidType('object', false))])
  )
  assert.equal(
    res3,
    new Joint([
      new AtKey([2], new InvalidType('string', { a: 'hello' })),
      new AtKey([2, 'a'], new InvalidType('number', 'hello')),
    ])
  )

  type R = InvalidType | (string | { a: number })[] | Joint<[AtKey<InvalidType>, AtKey<InvalidType> | MissingKey]>
  expectType<R>(res1)
  expectType<R>(res2)
  expectType<R>(res3)
})

test.run()
