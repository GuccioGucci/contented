import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { as, at, boolean, InvalidCoercion, number, string } from './As'
import { MissingKey } from './Property'

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

test('at', function () {
  const toC = at(['a', 'b', 'c'], string)

  const c1 = as(toC, { a: { b: { c: 'foo' } } })
  const c2 = as(toC, { a: 2 })
  const c3 = as(toC, { a: { b: 2 } })
  const c4 = as(toC, { a: { b: { c: 12 } } })
  const c5 = as(toC, undefined)

  equal(c1, 'foo')
  equal(c2, new MissingKey(['a', 'b']))
  equal(c3, new MissingKey(['a', 'b', 'c']))
  equal(c4, new InvalidCoercion('string', 12))
  equal(c5, new MissingKey(['a']))
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
