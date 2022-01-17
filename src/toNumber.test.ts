import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { coerce } from './To'
import { toNumber } from './toNumber'
import { InvalidCoercion } from './InvalidCoercion'

test('toNumber accepts number values', function () {
  assert(property(fcNumber, (value) => equal(coerce(toNumber, value), value)))
})

test('toNumber rejects all but number values', function () {
  const notANumber = fc.oneof(
    fc.string(),
    fc.boolean(),
    fc.constant(null),
    fc.constant(undefined),
    fcSymbol
  )

  assert(
    property(notANumber, (value) =>
      equal(coerce(toNumber, value), new InvalidCoercion('number', value))
    )
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
