import { test } from 'uvu'
import assert from 'uvu/assert'
import { number } from './number'
import { string } from './string'
import { coerceTo } from './Type'
import { InvalidCoercion } from './InvalidCoercion'

test(`or allows specifying alternatives`, function () {
  const stringOrNumber = string.or(number)

  const res1 = coerceTo(stringOrNumber, 'hello')
  const res2 = coerceTo(stringOrNumber, 15)

  assert.is(res1, 'hello')
  assert.is(res2, 15)
})

test(`or rejects input values that are not coercible to any given alternative`, function () {
  const stringOrNumber = string.or(number)

  const res1 = coerceTo(stringOrNumber, true)
  const res2 = coerceTo(stringOrNumber, { a: 2 })

  assert.equal(res1, new InvalidCoercion('number', true))
  assert.equal(res2, new InvalidCoercion('number', { a: 2 }))
})

test.run()
