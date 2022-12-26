import { test } from 'uvu'
import { is, equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { number } from './number'
import { coerceTo, InvalidType } from './coercion'
import { explain } from './explain'

test(`number accepts number values`, function () {
  assert(
    property(fcNumber, (value) => {
      const res = coerceTo(number, value)
      is(res, value)
    })
  )
})

test('number rejects all but number values', function () {
  assert(
    property(notANumber, (value) => {
      const res = coerceTo(number, value)
      is(res, undefined)
    })
  )
})

test(`there is an explanation why a value is not a number`, function () {
  assert(
    property(notANumber, (value) => {
      const why = explain(number, value)
      equal(why, {
        value,
        not: 'number',
        cause: [new InvalidType('number', value)],
      })
    })
  )
})

test(`there is no need for an explanation if the value is indeed a number`, function () {
  assert(
    property(fcNumber, (value) => {
      const why = explain(number, value)
      is(why, undefined)
    })
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
const notANumber = fc.oneof(fc.string(), fc.boolean(), fc.constant(null), fc.constant(undefined), fcSymbol)
