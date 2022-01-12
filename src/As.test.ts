import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { boolean, AsError, number, string } from './As'

test('string accepts string values', function () {
  assert(property(fc.string(), (value) => equal(string.from(value), value)))
})

test('string rejects all but string values', function () {
  const notAString = fc.oneof(
    fcNumber,
    fc.boolean(),
    fc.constant(null),
    fc.constant(undefined),
    fcSymbol
  )

  assert(
    property(notAString, (value) =>
      equal(string.from(value), new AsError('string', value))
    )
  )
})

test('boolean accepts boolean values', function () {
  assert(property(fc.boolean(), (value) => equal(boolean.from(value), value)))
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
      equal(boolean.from(value), new AsError('boolean', value))
    )
  )
})

test('number accepts number values', function () {
  assert(property(fcNumber, (value) => equal(number.from(value), value)))
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
      equal(number.from(value), new AsError('number', value))
    )
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
