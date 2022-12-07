import { test } from 'uvu'
import assert from 'uvu/assert'
import { number } from './v4/Type'
import { string } from './v4/Type'
import { coerceTo } from './v4/coerceTo'
import { AtKey, InvalidCoercion } from './InvalidCoercion'
import { MissingKey } from './MissingKey'
import { Joint } from './Joint'
import { oneOf } from './v4/Type'
import { boolean } from './v4/Type'
import { match } from './v4/Type'
import { object } from './v4/Type'

test(`oneOf allows specifying alternatives`, function () {
  const T = oneOf(string, object({ b: number }), boolean)

  const res1 = coerceTo(T, 'hello')
  const res2 = coerceTo(T, { b: 15 })
  const res3 = coerceTo(T, true)

  assert.is(res1, 'hello')
  assert.equal(res2, { b: 15 })
  assert.is(res3, true)
})

test(`oneOf rejects input values that are not coercible to any given alternative`, function () {
  const T = oneOf(match('a'), match('b'), match('c'))

  const res1 = coerceTo(T, true)
  const res2 = coerceTo(T, { a: 2 })

  assert.equal(
    res1,
    new Joint([new InvalidCoercion('a', true), new InvalidCoercion('b', true), new InvalidCoercion('c', true)])
  )
  assert.equal(
    res2,
    new Joint([
      new InvalidCoercion('a', { a: 2 }),
      new InvalidCoercion('b', { a: 2 }),
      new InvalidCoercion('c', { a: 2 }),
    ])
  )
})

test(`oneOf reports the path at which the error happened`, function () {
  const stringOrNumberAtA = oneOf(string, object({ a: number }))

  const res1 = coerceTo(stringOrNumberAtA, { b: 12 })
  const res2 = coerceTo(stringOrNumberAtA, { a: 'hello' })

  assert.equal(res1, new Joint([new InvalidCoercion('string', { b: 12 }), new MissingKey(['a'])]))

  assert.equal(
    res2,
    new Joint([new InvalidCoercion('string', { a: 'hello' }), new AtKey(['a'], new InvalidCoercion('number', 'hello'))])
  )
})

test(`oneOf reports multi-level missing keys`, function () {
  const T = object({ a: oneOf(string, object({ b: number })) })

  const res1 = coerceTo(T, { b: 12 })
  const res2 = coerceTo(T, { a: { c: 12 } })

  assert.equal(res1, new MissingKey(['a']))
  assert.equal(
    res2,
    new Joint([new AtKey(['a'], new InvalidCoercion('string', { c: 12 })), new MissingKey(['a', 'b'])])
  )
})

test.run()
