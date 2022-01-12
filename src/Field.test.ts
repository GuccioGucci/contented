import { test } from 'uvu'
import { equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { boolean, FieldIsNot, number, string } from './Field'
import {
  BooleanField,
  JsonField,
  LocationField,
  NumberField,
  StringField,
} from './arbitraries.test'

test('string accepts string fields', function () {
  assert(
    property(StringField, (field) =>
      equal(string.from(field), { value: field })
    )
  )
})

test('string rejects all but string fields', function () {
  const NotStringField = fc.oneof(
    NumberField,
    BooleanField,
    JsonField,
    LocationField
  )
  assert(
    property(NotStringField, (field) =>
      equal(string.from(field), { error: new FieldIsNot('string', field) })
    )
  )
})

test('boolean accepts boolean fields', function () {
  assert(
    property(BooleanField, (field) =>
      equal(boolean.from(field), { value: field })
    )
  )
})

test('boolean rejects all but boolean fields', function () {
  const NotBooleanField = fc.oneof(
    NumberField,
    StringField,
    JsonField,
    LocationField
  )
  assert(
    property(NotBooleanField, (field) =>
      equal(boolean.from(field), { error: new FieldIsNot('boolean', field) })
    )
  )
})

test('number accepts number fields', function () {
  assert(
    property(NumberField, (field) =>
      equal(number.from(field), { value: field })
    )
  )
})

test('number rejects all but number fields', function () {
  const NotNumberField = fc.oneof(
    BooleanField,
    StringField,
    JsonField,
    LocationField
  )
  assert(
    property(NotNumberField, (field) =>
      equal(number.from(field), { error: new FieldIsNot('number', field) })
    )
  )
})

test.run()
