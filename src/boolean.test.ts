import { test } from 'uvu'
import { is, equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { coerceTo } from './coercion'
import { explain } from './explain'
import { boolean } from './boolean'

test(`boolean accepts boolean values`, function () {
  assert(
    property(fc.boolean(), (value) => {
      const res = coerceTo(boolean, value)
      is(res, value)
    })
  )
})

test(`boolean rejects all but boolean values`, function () {
  assert(
    property(notABoolean, (value) => {
      const res = coerceTo(boolean, value)
      is(res, undefined)
    })
  )
})

test(`there is an explanation why a value is not a boolean`, function () {
  assert(
    property(notABoolean, (value) => {
      const why = explain(boolean, value)
      equal(why, {
        value,
        not: 'boolean',
        cause: [{ value, not: 'boolean' }],
      })
    })
  )
})

test(`there is no need for an explanation if the value is indeed a boolean`, function () {
  assert(
    property(fc.boolean(), (value) => {
      const why = explain(boolean, value)
      is(why, undefined)
    })
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
const notABoolean = fc.oneof(fcNumber, fc.string(), fc.constant(null), fc.constant(undefined), fcSymbol)
