import fc from 'fast-check'

export const lat = fc.float({ min: -90, max: 90 + Number.EPSILON, noNaN: true }).map(lat => lat.toString())
export const lon = fc.float({ min: -180, max: 180 + Number.EPSILON, noNaN: true }).map(lon => lon.toString())

export const StringField = fc.string()
export const NumberField = fc.oneof(fc.float(), fc.double(), fc.integer())
export const BooleanField = fc.boolean()
export const JsonField = fc.dictionary(fc.string(), fc.jsonValue())
export const LocationField = fc.record({ lat, lon })