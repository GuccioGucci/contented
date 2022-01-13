import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { as, boolean, InvalidCoercion, number, string } from './As'

test('string accepts string values', function () {
  assert(property(fc.string(), (value) => equal(as(string, value), value)))
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
      equal(as(string, value), new InvalidCoercion('string', value))
    )
  )
})

test('boolean accepts boolean values', function () {
  assert(property(fc.boolean(), (value) => equal(as(boolean, value), value)))
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
      equal(as(boolean, value), new InvalidCoercion('boolean', value))
    )
  )
})

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
