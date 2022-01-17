import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { coerce } from './To'
import { InvalidCoercion } from './InvalidCoercion'
import { toString } from './toString'

test('toString accepts string values', function () {
  assert(
    property(fc.string(), (value) => equal(coerce(toString, value), value))
  )
})

test('toString rejects all but string values', function () {
  const notAString = fc.oneof(
    fcNumber,
    fc.boolean(),
    fc.constant(null),
    fc.constant(undefined),
    fcSymbol
  )

  assert(
    property(notAString, (value) =>
      equal(coerce(toString, value), new InvalidCoercion('string', value))
    )
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
