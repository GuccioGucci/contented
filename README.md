# Contented

## Table of Contents

- [Introduction](#introduction)
- [Reference](#reference)
  - [Primitive types](#primitive-types)
    - [`string`](#string)
    - [`number`](#number)
    - [`boolean`](#boolean)
  - [Array types](#array-types)
    - [`arrayOf(T)`](#arrayoft)

## Introduction

Contented is a TypeScript library for performing type coercion at run-time. To this end, Contented introduces run-time representations of primitive types, such as strings, which can be then mixed and matched to describe compound types.

```typescript
const Image = combine(
  (url, size) => ({ url, size }),
  at(['url'], string),
  at(['metadata', 'size'], number)
);

const image = coerceTo(Image, data /* abritrary data */);
```

Contented may be useful every time there are expectations — but no guarantees, on the shape of data acquired at run-time. Common use cases include processing data coming over the wire, files, or any other external source.

## Reference

### Primitive types

#### `string`

A run-time representation of the `string` type. An attempt to coerce to `string` may result in either the string itself (if the input data is indeed a string) or an `InvalidCoercion` error.

```typescript
import { string, coerceTo } from 'contented';

coerceTo(string, 'hello');
// => 'hello'

coerceTo(string, 42);
// => InvalidCoercion { expected: 'string', got: 42 }
```

#### `number`

A run-time representation of the `number` type. An attempt to coerce to `number` may result in either the number itself (if the input data is indeed a number) or an `InvalidCoercion` error.

```typescript
import { number, coerceTo } from 'contented';

coerceTo(number, 42);
// => 42

coerceTo(number, 'hello');
// => InvalidCoercion { expected: 'number', got: 'hello' }
```

#### `boolean`

A run-time representation of the `boolean` type. An attempt to coerce to `boolean` may result in either the boolean itself (if the input data is indeed a boolean) or an `InvalidCoercion` error.

```typescript
import { boolean, coerceTo } from 'contented';

coerceTo(boolean, true);
// => true

coerceTo(boolean, 'hello');
// => InvalidCoercion { expected: 'boolean', got: 'hello' }
```

### Array types

#### `arrayOf(T)`

A run-time representation of an array of `T`s, where `T` denotes the run-time representation of its element type.

```typescript
import { number, arrayOf, coerceTo } from 'contented';

coerceTo(arrayOf(number), [3, 4, 5]);
// => [3, 4, 5]

coerceTo(arrayOf(number), 'hello');
// => InvalidCoercion { expected: 'array', got: 'hello' }

coerceTo(arrayOf(number), [3, 'a', 5]);
/* => AtKey {
        path: [1],
        error: InvalidCoercion { expected: 'number', got: 'a' }
      }
*/
```