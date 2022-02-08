# Contented

## Introduction

Contented is a TypeScript library for performing type coercion at run-time. To this end, Contented introduces run-time representations of basic types, such as strings, which can be then mixed and matched to describe compound types.

```typescript
const Image = combine(
  (url, size) => ({ url, size }),
  at(['url'], string),
  at(['metadata', 'size'], number)
)

const image = coerceTo(Image, data /* abritrary data */)
```

Contented may be useful every time there are expectations — but no guarantees, on the shape of data acquired at run-time. Common use cases include processing data coming over the wire, files, or any other external source.

## References

### Basic types

#### `string`

A run-time representation of the `string` type. An attempt to coerce to `string` may result in either the string itself, if the input data was indeed a string, or in a `InvalidCoercion` error.

```typescript
import { string, coerceTo } from 'contented'

coerceTo(string, 'hello')
// => 'hello'

coerceTo(string, 42)
// => InvalidCoercion { expected: 'string', got: 42 }
```
