import { test } from 'uvu'
import { is, equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { expectType } from 'ts-expect'
import { coerceTo, InvalidCoercion } from './coerceTo'
import { boolean } from './boolean'

test(`boolean accepts boolean values`, function () {
  assert(
    property(fc.boolean(), (value) => {
      const res = coerceTo(boolean, value)

      expectType<boolean | InvalidCoercion>(res)
      is(res, value)
    })
  )
})

test(`boolean rejects all but boolean values`, function () {
  assert(
    property(notABoolean, (value) => {
      const res = coerceTo(boolean, value)

      expectType<boolean | InvalidCoercion>(res)
      equal(res, new InvalidCoercion('boolean', value))
    })
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
const notABoolean = fc.oneof(fcNumber, fc.string(), fc.constant(null), fc.constant(undefined), fcSymbol)
