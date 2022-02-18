import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { coerceTo } from './Type'
import { number } from './number'
import { InvalidCoercion } from './InvalidCoercion'

test(`number accepts number values`, function () {
  assert(property(fcNumber, (value) => equal(coerceTo(number, value), value)))
})

test('number rejects all but number values', function () {
  const notANumber = fc.oneof(fc.string(), fc.boolean(), fc.constant(null), fc.constant(undefined), fcSymbol)

  assert(property(notANumber, (value) => equal(coerceTo(number, value), new InvalidCoercion('number', value))))
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
