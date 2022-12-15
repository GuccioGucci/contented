<div align="center">
  <img src="https://github.com/GuccioGucci/contented/blob/main/contented.svg?raw=true" width="250"/>
</div>

<p align="center">
  A library to coerce values at run-time.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@gucciogucci/contented">
    <img alt="NPM" src="https://badgen.net/npm/v/@gucciogucci/contented"/>
  </a>
  <img alt="Node.js" src="https://img.shields.io/node/v/@gucciogucci/contented.svg">
  <a href="https://github.com/GuccioGucci/contented/actions/workflows/test.yml"><img alt="Test" src="https://github.com/GuccioGucci/contented/actions/workflows/test.yml/badge.svg"></a>
  <a href="https://bundlephobia.com/package/@gucciogucci/contented"><img alt="Bundlephobia Minified" src="https://img.shields.io/bundlephobia/min/@gucciogucci/contented.svg"></a>
</p>

## Table of Contents

- [Introduction](#introduction)
- [Reference](#reference)
  - [Coercing](#coercing)
    - [`coerceTo(T, input)`](#coercetot-input)
  - [Primitive types](#primitive-types)
    - [`string`](#string)
    - [`number`](#number)
    - [`boolean`](#boolean)
  - [Literal types](#literal-types)
    - [`literal`](#literal)
  - [Compound types](#compound-types)
    - [`object`](#object)
    - [`arrayOf(T)`](#arrayoft)
    - [`oneOf(T1, T2, ...Ts)`](#oneoft1-t2-ts)
  - [Utility types](#utility-types)
    - [`Infer`](#infer)
  - [Errors](#errors)
    - [`CoercionError`](#coercionerror)
    - [`InvalidType`](#invalidtype)
    - [`AtKey<InvalidType>`](#atkeyinvalidcoercion)
    - [`MissingKey`](#missingkey)
    - [`Joint`](#joint)
- [License](#license)

## Introduction

Contented is a TypeScript library for performing type coercion at run-time. To this end, Contented introduces run-time representations of primitive types, such as `string`, which can be then mixed and matched to describe compound types.

```typescript
import { string, number, object, coerceTo } from '@gucciogucci/contented';

const Image = object({
  url: string,
  size: number
});

const image = coerceTo(Image, data /* arbitrary data */);
```

Contented may be useful every time there are expectations — but no real guarantees, on the shape of data acquired at run-time. Common use cases include processing data coming over the wire, from files, or any other external source.

## Reference

### Coercing

#### `coerceTo(T, input)`

Attempts to coerce the `input` data to the type represented by `T`. Note that the specific return value, whether successful or not, depends on the particular `T`.

```typescript
import { string, coerceTo } from '@gucciogucci/contented';

coerceTo(string, 'hello');
// 'hello'

coerceTo(string, 42);
// InvalidType { expected: 'string', got: 42 }
```

### Primitive types

#### `string`

A run-time representation of the `string` type. An attempt to coerce to `string` may result in either the string itself (if the input data is indeed a string) or an `InvalidType` error.

```typescript
import { string, coerceTo } from '@gucciogucci/contented';

coerceTo(string, 'hello');
// 'hello'

coerceTo(string, 42);
// InvalidType { expected: 'string', got: 42 }
```

#### `number`

A run-time representation of the `number` type. An attempt to coerce to `number` may result in either the number itself (if the input data is indeed a number) or an `InvalidType` error.

```typescript
import { number, coerceTo } from '@gucciogucci/contented';

coerceTo(number, 42);
// 42

coerceTo(number, 'hello');
// InvalidType { expected: 'number', got: 'hello' }
```

#### `boolean`

A run-time representation of the `boolean` type. An attempt to coerce to `boolean` may result in either the boolean itself (if the input data is indeed a boolean) or an `InvalidType` error.

```typescript
import { boolean, coerceTo } from '@gucciogucci/contented';

coerceTo(boolean, true);
// true

coerceTo(boolean, 'hello');
// InvalidType { expected: 'boolean', got: 'hello' }
```

## Literal types

#### `literal`

A run-time representation of the narrowest type that can be constructed from `value`. Hence, coercions to `literal(value)` succeed only when `value` is provided as an input.

```typescript
import { literal, coerceTo } from '@gucciogucci/contented';

coerceTo(literal('hello'), 'hello');
// 'hello'

coerceTo(literal('hello'), 'foo');
// InvalidType { expected: 'hello', got: 'foo' }
```

### Compound types

#### `object`

A run-time representation of an object.

```typescript
import { number, object, coerceTo } from '@gucciogucci/contented';

const Point = object({ x: number, y: number });

coerceTo(Point, { x: 10, y : 20 });
// { x: 10, y: 20 }
```

As with compile-time types, optional properties are marked by adding a `?` at the end of their names:

```typescript
import { number, object, coerceTo } from '@gucciogucci/contented';

const Point = object({ x: number, y: number, 'z?': number })

coerceTo(Point, {x: 10, y: 20 });
// { x: 10, y: 20 }

coerceTo(Point, { x: 10, y: 20, z: 30 });
// { x: 10, y: 20, z: 30 }

coerceTo(Point, { x: 10, y: 20, z: undefined });
// { x: 10, y: 20, z: undefined }
```

### Array types

#### `arrayOf(T)`

A run-time representation of an array of `T`s, where `T` denotes the run-time representation of its element type.

```typescript
import { number, arrayOf, coerceTo } from '@gucciogucci/contented';

coerceTo(arrayOf(number), [3, 4, 5]);
// [ 3, 4, 5 ]

coerceTo(arrayOf(number), 'hello');
// InvalidType { expected: 'array', got: 'hello' }

coerceTo(arrayOf(number), [3, 'a', 5]);
// AtKey { atKey: [ 1 ], error: InvalidType { expected: 'number', got: 'a' } }
```

#### `oneOf(T1, T2, ...Ts)`

A run-time representation of the union type `T1 | T2 | ...Ts`. In case of a failed coercion, the result encloses the errors coming from both `T1`, `T2`, and all subsequent alternatives.


```typescript
import { oneOf, match, coerceTo } from '@gucciogucci/contented';

const abc = oneOf(match('a'), match('b'), match('c'));

coerceTo(abc, 'a');
// 'a'

coerceTo(abc, 'd');
/* Joint {
    errors: [
      InvalidType { expected: 'a', got: 'd' },
      InvalidType { expected: 'b', got: 'd' },
      InvalidType { expected: 'c', got: 'd' }
    ]
   }
*/
```

### Utility types

#### `Infer`

`Infer` comes in handy every time it is necessary to infer the compile-time type corresponding to some run-time representation `T`.

```typescript
import { Infer, string, object, coerceTo } from '@gucciogucci/contented';

const User = object({
  name: string,
  surname: string,
  contacts: object({ phone: string })
});

function fn(user: Infer<typeof User>) {
  // here, user : { name: string; surname: string; contacts: { phone: string } }
}
```

### Errors

### `CoercionError`

Unsuccesful attempts to coerce to the desired run-time type are signaled by returning a `CoercionError`. Every error in the following sections specializes `CoercionError`.

```typescript
const res = coerceTo(Image, data);
if (res instanceof Coercionerror) {
  // error-handling logic
}
```

#### `InvalidType`

When the input data does not conform to the expected type, `coerceTo` returns a `InvalidType`, which contains both the expectation and the actual value.

```typescript
import { string, coerceTo } from '@gucciogucci/contented';

coerceTo(string, 42);
// InvalidType { expected: 'string', got: 42 }
```
#### `AtKey<InvalidType>`

An `InvalidType` error, together with the path at which to find the non-conforming data.

```typescript
import { number, arrayOf, object, coerceTo } from '@gucciogucci/contented';

coerceTo(object({ 'x': number }), { x: 'hello' });
// AtKey { atKey: [ 'x' ], error: InvalidType { expected: 'number', got: 'hello' } }

coerceTo(arrayOf(number), [3, 'a', 5]);
// AtKey { atKey: [ 1 ], error: InvalidType { expected: 'number', got: 'a' } }
```

#### `MissingKey`

The path at which a non-existing key in the input data was instead expected.

```typescript
import { number, at, coerceTo } from '@gucciogucci/contented';

coerceTo(object({ 'x': number }), { y: 12 });
// MissingKey { missingKey: [ 'x' ] }
```

#### `Joint`

When multiple alternatives are provided but none of them is applicable to the input data, `coerceTo` returns a `Joint` error, reporting the errors resulting from the different failed attempts.

```typescript
import { string, number, oneOf, coerceTo } from '@gucciogucci/contented';

coerceTo(oneOf(string, number), true);
/* Joint {
    errors: [
      InvalidType { expected: 'string', got: true },
      InvalidType { expected: 'number', got: true }
    ]
   }
*/
```

## License

Copyright 2022 Gucci.

Licensed under the [GNU Lesser General Public License, Version 3.0](http://www.gnu.org/licenses/lgpl.txt)
