import { test } from 'uvu'
import assert from 'uvu/assert'
import { AtKey, InvalidCoercion } from './InvalidCoercion'
import { MissingKey } from './MissingKey'
import { number } from './v4/Type'
import { object } from './v4/Type'
import { string } from './v4/Type'
import { coerceTo } from './v4/coerceTo'

test(`object succeeds if the input data is an object adhering to the expectations`, function () {
  const Point = object({ x: string, y: number })

  const res = coerceTo(Point, { x: 'hello', y: 12 })

  assert.equal(res, { x: 'hello', y: 12 })
})

test(`object rejects the input data upon the first missing element`, function () {
  const XY = object({ x: string, y: number })

  const res = coerceTo(XY, { x: 'hello' })

  assert.equal(res, new MissingKey(['y']))
})

test(`object rejects the input data upon the first mismatching element`, function () {
  const XY = object({ x: string, y: number })

  const res = coerceTo(XY, { x: 'hello', y: false })

  assert.equal(res, new AtKey(['y'], new InvalidCoercion('number', false)))
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
