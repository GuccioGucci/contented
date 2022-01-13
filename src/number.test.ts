import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { as, InvalidCoercion } from './As'
import { number } from './number'

test('number accepts number values', function () {
  assert(property(fcNumber, (value) => equal(as(number, value), value)))
})

test('number rejects all but number values', function () {
  const notANumber = fc.oneof(
    fc.string(),
    fc.boolean(),
    fc.constant(null),
    fc.constant(undefined),
    fcSymbol
  )

  assert(
    property(notANumber, (value) =>
      equal(as(number, value), new InvalidCoercion('number', value))
    )
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
