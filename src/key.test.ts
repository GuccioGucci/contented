import { test } from 'uvu'
import assert from 'uvu/assert'
import { coerce } from './To'
import { toNumber } from './toNumber'
import { toString } from './toString'
import { at, AtKey, fallback, MissingKey } from './key'
import { InvalidCoercion } from './InvalidCoercion'

test(`at leads to the value of an object's property`, function () {
  const cToNumber = at(['a', 'b', 'c'], toNumber)

  const c = coerce(cToNumber, { a: { b: { c: 12 } } })

  assert.is(c, 12)
})

test(`at supports navigating an array when numeric keys are used`, function () {
  const lastToString = at([2], toString)
  const bToNumber = at(['a', 1, 'b'], toNumber)

  const last = coerce(lastToString, ['b', 'c', 'd'])
  const b = coerce(bToNumber, { a: [{ b: 1 }, { b: 2 }] })

  assert.is(last, 'd')
  assert.is(b, 2)
})

test(`pointing to a non-existing property reports when the path got interrupted`, function () {
  const cToNumber = at(['a', 'b', 'c'], toNumber)

  const c1 = coerce(cToNumber, { a: 2 })
  const c2 = coerce(cToNumber, { a: { b: 3 } })
  const c3 = coerce(cToNumber, { a: { b: { d: 3 } } })
  const c4 = coerce(cToNumber, {})

  assert.equal(c1, new MissingKey(['a', 'b']))
  assert.equal(c2, new MissingKey(['a', 'b', 'c']))
  assert.equal(c3, new MissingKey(['a', 'b', 'c']))
  assert.equal(c4, new MissingKey(['a']))
})

test(`any error on the value part of a property is accompanied by the property path`, function () {
  const cToNumber = at(['a', 'b', 'c'], toNumber)

  const c1 = coerce(cToNumber, { a: { b: { c: 'hello' } } })

  assert.equal(
    c1,
    new AtKey(['a', 'b', 'c'], new InvalidCoercion('number', 'hello'))
  )
})

test(`fallback returns a fallback value in case of an interrupted path towards a key`, function () {
  const cToNumber = fallback(at(['a', 'b', 'c'], toNumber), 42)

  const c1 = coerce(cToNumber, { a: 2 })
  const c2 = coerce(cToNumber, { a: { b: 3 } })
  const c3 = coerce(cToNumber, { a: { b: { d: 3 } } })

  assert.is(c1, 42)
  assert.is(c2, 42)
  assert.is(c3, 42)
})

test.run()
