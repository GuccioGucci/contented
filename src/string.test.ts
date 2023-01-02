import { test } from 'uvu'
import { is, equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { string } from './string'
import { coerceTo } from './coercion'
import { explain } from './explain'

test(`string accepts string values`, function () {
  assert(
    property(fc.string(), (value) => {
      const res = coerceTo(string, value)
      is(res, value)
    })
  )
})

test(`string rejects all but string values`, function () {
  assert(
    property(notAString, (value) => {
      const res = coerceTo(string, value)
      is(res, undefined)
    })
  )
})

test(`there is an explanation why a value is not a string`, function () {
  assert(
    property(notAString, (value) => {
      const why = explain(string, value)
      equal(why, {
        value,
        isNot: 'string',
      })
    })
  )
})

test(`there is no need for an explanation if the value is indeed a string`, function () {
  assert(
    property(fc.string(), (value) => {
      const why = explain(string, value)
      is(why, undefined)
    })
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
const notAString = fc.oneof(fcNumber, fc.boolean(), fc.constant(null), fc.constant(undefined), fcSymbol)
