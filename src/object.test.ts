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

  const why = explain(Point, 'hello')

  assert.equal(why, {
    value: 'hello',
    not: { object: { x: 'string', y: 'number' } },
    cause: [
      {
        value: 'hello',
        not: { object: { x: 'string', y: 'number' } },
      },
    ],
  })
})

test(`object rejects the input data upon the first missing element`, function () {
  const Point = object({ x: string, y: number })

  const res = coerceTo(Point, { x: 'hello' })

  assert.is(res, undefined)
})

test(`there is an explanation if the input data is missing one or more keys`, function () {
  const Point = object({ x: string, y: number })

  const why1 = explain(Point, {})
  const why2 = explain(Point, { x: 'hello' })

  assert.equal(why1, {
    value: {},
    not: { object: { x: 'string', y: 'number' } },
    cause: [{ missingKey: 'x' }, { missingKey: 'y' }],
  })

  assert.equal(why2, {
    value: { x: 'hello' },
    not: { object: { x: 'string', y: 'number' } },
    cause: [{ missingKey: 'y' }],
  })
})

test(`object rejects the input data upon the first mismatching element`, function () {
  const Point = object({ x: string, y: number })

  const res = coerceTo(Point, { x: 'hello', y: false })

  assert.is(res, undefined)
})

test(`there is an explanation if the input data presents invalid properties`, function () {
  const Point = object({ x: string, y: number })

  const why = explain(Point, { x: true, y: false })
  assert.equal(why, {
    value: { x: true, y: false },
    not: { object: { x: 'string', y: 'number' } },
    cause: [
      { atKey: 'x', value: true, not: 'string', cause: [{ value: true, not: 'string' }] }, // FIXME: remove extra cause
      { atKey: 'y', value: false, not: 'number', cause: [{ value: false, not: 'number' }] },
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
