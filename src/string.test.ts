import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { coerceTo } from './Type'
import { InvalidCoercion } from './InvalidCoercion'
import { string } from './string'

test(`string accepts string values`, function () {
  assert(property(fc.string(), (value) => equal(coerceTo(string, value), value)))
})

test(`string rejects all but string values`, function () {
  const notAString = fc.oneof(fcNumber, fc.boolean(), fc.constant(null), fc.constant(undefined), fcSymbol)

  assert(property(notAString, (value) => equal(coerceTo(string, value), new InvalidCoercion('string', value))))
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
