import { test } from 'uvu'
import assert from 'uvu/assert'
import { as, InvalidCoercion } from './As'
import { at, MissingKey } from './at'
import { number } from './number'
import { string } from './string'

test(`at leads to the value of an object's property`, function () {
  const toC = at(['a', 'b', 'c'], number)

  const c = as(toC, { a: { b: { c: 12 } } })

  assert.is(c, 12)
})

test(`at supports navigating an array when numeric keys are used`, function () {
  const toLast = at([2], string)
  const toB = at(['a', 1, 'b'], number)

  const last = as(toLast, ['b', 'c', 'd'])
  const b = as(toB, { a: [{ b: 1 }, { b: 2 }] })

  assert.is(last, 'd')
  assert.is(b, 2)
})

test(`a path to a non-existing property reports when the path got interrupted`, function () {
  const toC = at(['a', 'b', 'c'], number)

  const c1 = as(toC, { a: 2 })
  const c2 = as(toC, { a: { b: 3 } })
  const c3 = as(toC, { a: { b: { d: 3 } } })
  const c4 = as(toC, {})

  assert.equal(c1, new MissingKey(['a', 'b']))
  assert.equal(c2, new MissingKey(['a', 'b', 'c']))
  assert.equal(c3, new MissingKey(['a', 'b', 'c']))
  assert.equal(c4, new MissingKey(['a']))
})

test('at', function () {
  const toC = at(['a', 'b', 'c'], string)

  const c1 = as(toC, { a: { b: { c: 'foo' } } })
  const c2 = as(toC, { a: 2 })
  const c3 = as(toC, { a: { b: 2 } })
  const c4 = as(toC, { a: { b: { c: 12 } } })
  const c5 = as(toC, undefined)

  assert.equal(c1, 'foo')
  assert.equal(c2, new MissingKey(['a', 'b']))
  assert.equal(c3, new MissingKey(['a', 'b', 'c']))
  assert.equal(c4, new InvalidCoercion('string', 12))
  assert.equal(c5, new MissingKey(['a']))
})

test.run()
