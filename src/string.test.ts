import { test } from 'uvu'
import { is, equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { expectType } from 'ts-expect'
import { InvalidType, coerceTo } from './coercion'
import { string } from './string'
import { explain } from './explain'

test(`string accepts string values`, function () {
  assert(
    property(fc.string(), (value) => {
      const res = coerceTo(string, value)

      expectType<string | InvalidType>(res)
      is(res, value)
    })
  )
})

test(`string rejects all but string values`, function () {
  assert(
    property(notAString, (value) => {
      const res = coerceTo(string, value)

      expectType<string | InvalidType>(res)
      equal(res, new InvalidType('string', value))
    })
  )
})

test(`there is an explanation why a value is not a string`, function () {
  assert(
    property(notAString, (value) => {
      const why = explain(string, value)
      equal(why, {
        value,
        not: 'string',
        cause: [new InvalidType('string', value)],
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
