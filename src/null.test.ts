import { test } from 'uvu'
import { is, equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { null_ } from './null'
import { coerceTo } from './coerceTo'
import { explain } from './explain'

test(`null_ accepts null values`, function () {
  const res = coerceTo(null_, null)
  is(res, null)
})

test(`null_ rejects all but null values`, function () {
  assert(
    property(notNull, (value) => {
      const res = coerceTo(null_, value)
      is(res, undefined)
    })
  )
})

test(`there is an explanation why a value is not null`, function () {
  assert(
    property(notNull, (value) => {
      const exp = explain(null_, value)
      equal(exp, {
        value,
        isNot: 'null',
      })
    })
  )
})

test(`there is no need for an explanation if the value is indeed null`, function () {
  const exp = explain(null_, null)
  is(exp, undefined)
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
const notNull = fc.oneof(fcNumber, fc.boolean(), fc.string(), fc.constant(undefined), fcSymbol)
