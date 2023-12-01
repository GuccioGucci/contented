import { test } from 'uvu'
import { is, equal } from 'uvu/assert'
import { number } from './number'
import { string } from './string'
import { oneOf } from './oneOf'
import { boolean } from './boolean'
import { literal } from './literal'
import { object } from './object'
import { coerceTo } from './coerceTo'
import { explain } from './explain'

test(`oneOf allows specifying alternatives`, function () {
  const T = oneOf(string, object({ b: number }), boolean)

  const res1 = coerceTo(T, 'hello')
  const res2 = coerceTo(T, { b: 15 })
  const res3 = coerceTo(T, true)

  is(res1, 'hello')
  equal(res2, { b: 15 })
  is(res3, true)
})

test(`oneOf rejects input values that are not coercible to any given alternative`, function () {
  const T = oneOf(literal('a'), literal('b'), literal('c'))

  const res1 = coerceTo(T, true)
  const res2 = coerceTo(T, { a: 2 })

  is(res1, undefined)
  is(res2, undefined)
})

test(`there is an explanation if the input value is not coercibile to any given alternative`, function () {
  const T = oneOf(literal('a'), literal('b'), literal('c'))

  const exp1 = explain(T, true)
  const exp2 = explain(T, { a: 2 })

  equal(exp1, {
    value: true,
    isNot: { oneOf: [{ literal: 'a' }, { literal: 'b' }, { literal: 'c' }] },
    since: [
      { value: true, isNot: { literal: 'a' } },
      { value: true, isNot: { literal: 'b' } },
      { value: true, isNot: { literal: 'c' } },
    ],
  })
  equal(exp2, {
    value: { a: 2 },
    isNot: { oneOf: [{ literal: 'a' }, { literal: 'b' }, { literal: 'c' }] },
    since: [
      { value: { a: 2 }, isNot: { literal: 'a' } },
      { value: { a: 2 }, isNot: { literal: 'b' } },
      { value: { a: 2 }, isNot: { literal: 'c' } },
    ],
  })
})

test(`oneOf reports the path at which the error happened`, function () {
  const stringOrNumberAtA = oneOf(string, object({ a: number }))

  const res1 = coerceTo(stringOrNumberAtA, { b: 12 })
  const res2 = coerceTo(stringOrNumberAtA, { a: 'hello' })

  is(res1, undefined)
  is(res2, undefined)
})

test(`the explanation mentions the path at which the error happened`, function () {
  const stringOrNumberAtA = oneOf(string, object({ a: number }))

  const exp1 = explain(stringOrNumberAtA, { b: 12 })
  const exp2 = explain(stringOrNumberAtA, { a: 'hello' })

  equal(exp1, {
    value: { b: 12 },
    isNot: { oneOf: ['string', { object: { a: 'number' } }] },
    since: [
      {
        value: { b: 12 },
        isNot: 'string',
      },
      {
        value: { b: 12 },
        isNot: { object: { a: 'number' } },
        since: [{ missingKey: 'a' }],
      },
    ],
  })
  equal(exp2, {
    value: { a: 'hello' },
    isNot: { oneOf: ['string', { object: { a: 'number' } }] },
    since: [
      {
        value: { a: 'hello' },
        isNot: 'string',
      },
      {
        value: { a: 'hello' },
        isNot: { object: { a: 'number' } },
        since: [{ atKey: 'a', value: 'hello', isNot: 'number' }],
      },
    ],
  })
})

test(`oneOf reports multi-level missing keys`, function () {
  const T = object({ a: oneOf(string, object({ b: number })) })

  const res1 = coerceTo(T, { b: 12 })
  const res2 = coerceTo(T, { a: { c: 12 } })

  is(res1, undefined)
  is(res2, undefined)
})

test(`there is an explanation in case of multi-level missing keys`, function () {
  const T = object({ a: oneOf(string, object({ b: number })) })

  const exp1 = explain(T, { b: 12 })
  const exp2 = explain(T, { a: { c: 12 } })

  equal(exp1, {
    value: { b: 12 },
    isNot: { object: { a: { oneOf: ['string', { object: { b: 'number' } }] } } },
    since: [{ missingKey: 'a' }],
  })
  equal(exp2, {
    value: { a: { c: 12 } },
    isNot: { object: { a: { oneOf: ['string', { object: { b: 'number' } }] } } },
    since: [
      {
        atKey: 'a',
        value: { c: 12 },
        isNot: { oneOf: ['string', { object: { b: 'number' } }] },
        since: [
          {
            value: { c: 12 },
            isNot: 'string',
          },
          {
            value: { c: 12 },
            isNot: { object: { b: 'number' } },
            since: [{ missingKey: 'b' }],
          },
        ],
      },
    ],
  })
})

test.run()
