import { test } from 'uvu'
import assert from 'uvu/assert'
import { number } from './number'
import { object } from './object'
import { string } from './string'
import { coerceTo } from './coercion'
import { explain } from './explain'

test(`object succeeds if the input data is an object adhering to the expectations`, function () {
  const Point = object({ x: string, y: number })

  const res = coerceTo(Point, { x: 'hello', y: 12 })

  assert.equal(res, { x: 'hello', y: 12 })
})

test(`object fails if the input data is not an object`, function () {
  const Point = object({ x: string, y: number })

  const res = coerceTo(Point, 'hello')

  assert.is(res, undefined)
})

test(`there is an explanation if the input data is not an object`, function () {
  const Point = object({ x: string, y: number })

  const exp = explain(Point, 'hello')

  assert.equal(exp, {
    value: 'hello',
    isNot: { object: { x: 'string', y: 'number' } },
  })
})

test(`object rejects the input data upon the first missing element`, function () {
  const Point = object({ x: string, y: number })

  const res = coerceTo(Point, { x: 'hello' })

  assert.is(res, undefined)
})

test(`there is an explanation if the input data is missing one or more keys`, function () {
  const Point = object({ x: string, y: number })

  const exp1 = explain(Point, {})
  const exp2 = explain(Point, { x: 'hello' })

  assert.equal(exp1, {
    value: {},
    isNot: { object: { x: 'string', y: 'number' } },
    since: [{ missingKey: 'x' }, { missingKey: 'y' }],
  })

  assert.equal(exp2, {
    value: { x: 'hello' },
    isNot: { object: { x: 'string', y: 'number' } },
    since: [{ missingKey: 'y' }],
  })
})

test(`object rejects the input data upon the first mismatching element`, function () {
  const Point = object({ x: string, y: number })

  const res = coerceTo(Point, { x: 'hello', y: false })

  assert.is(res, undefined)
})

test(`there is an explanation if the input data presents invalid properties`, function () {
  const Point = object({ x: string, y: number })

  const exp = explain(Point, { x: true, y: false })
  assert.equal(exp, {
    value: { x: true, y: false },
    isNot: { object: { x: 'string', y: 'number' } },
    since: [
      { atKey: 'x', value: true, isNot: 'string' },
      { atKey: 'y', value: false, isNot: 'number' },
    ],
  })
})

test(`object marks optional fields by ending keys with ?`, function () {
  const obj = object({ 'x?': string, y: number })

  const res1 = coerceTo(obj, { x: 'hello', y: 20 })
  const res2 = coerceTo(obj, { x: undefined, y: 20 })
  const res3 = coerceTo(obj, { y: 20 })

  assert.equal(res1, { x: 'hello', y: 20 })
  assert.equal(res2, { x: undefined, y: 20 })
  assert.equal(res3, { y: 20 })
})

test.run()
