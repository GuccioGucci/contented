import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { coerce, InvalidCoercion } from './To'
import { toBoolean } from './toBoolean'

test('toBoolean accepts boolean values', function () {
  assert(
    property(fc.boolean(), (value) => equal(coerce(value, toBoolean), value))
  )
})

test('toBoolean rejects all but boolean values', function () {
  const notABoolean = fc.oneof(
    fcNumber,
    fc.string(),
    fc.constant(null),
    fc.constant(undefined),
    fcSymbol
  )
  assert(
    property(notABoolean, (value) =>
      equal(coerce(value, toBoolean), new InvalidCoercion('boolean', value))
    )
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
