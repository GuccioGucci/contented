import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { coerceTo } from './Type'
import { InvalidCoercion } from './error/InvalidCoercion'
import { boolean } from './boolean'

test('boolean accepts boolean values', function () {
  assert(
    property(fc.boolean(), (value) => equal(coerceTo(boolean, value), value))
  )
})

test('boolean rejects all but boolean values', function () {
  const notABoolean = fc.oneof(
    fcNumber,
    fc.string(),
    fc.constant(null),
    fc.constant(undefined),
    fcSymbol
  )
  assert(
    property(notABoolean, (value) =>
      equal(coerceTo(boolean, value), new InvalidCoercion('boolean', value))
    )
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
