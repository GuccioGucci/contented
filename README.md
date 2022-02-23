<div align="center">
  <img src="https://github.com/GuccioGucci/contented/blob/main/contented.svg?raw=true" width="250"/>
</div>

<p align="center">
  A library to coerce values at run-time.
</p>

<p align="center">
  <a href="https://github.com/GuccioGucci/contented/actions/workflows/test.yml"><img alt="Test" src="https://github.com/GuccioGucci/contented/actions/workflows/test.yml/badge.svg"></a>
  <img alt="Node.js" src="https://img.shields.io/node/v/@gucciogucci/contented.svg">
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
  - [Object types](#object-types)
    - [`at(path, T)`](#atpath-t)
    - [`fallback(T, substitute)`](#fallbackt-substitute)
  - [Array types](#array-types)
    - [`arrayOf(T)`](#arrayoft)
    - [`permissiveArrayOf(T)`](#permissivearrayoft)
  - [Narrowing](#narrowing)
    - [`match(value)`](#matchvalue)
    - [`always(value)`](#alwaysvalue)
  - [Combinations & Alternatives](#combinations--alternatives)
    - [`combine(fn, ...Ts)`](#combinefn-ts)
    - [`T1.or(T2)`](#t1ort2)
  - [Errors](#errors)
    - [`InvalidCoercion`](#invalidcoercion)
    - [`AtKey<InvalidCoercion>`](#atkeyinvalidcoercion)
    - [`MissingKey`](#missingkey)
    - [`Joint<[...Errs]>`](#jointerrs)
- [License](#license)

## Introduction

Contented is a TypeScript library for performing type coercion at run-time. To this end, Contented introduces run-time representations of primitive types, such as `string`, which can be then mixed and matched to describe compound types.

```typescript
import { string, number, at, combine, coerceTo } from '@gucciogucci/contented';

const Image = combine(
  (url, size) => ({ url, size }),
  at('url', string),
  at(['metadata', 'size'], number)
);

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
// InvalidCoercion { expected: 'string', got: 42 }
```

### Primitive types

#### `string`

A run-time representation of the `string` type. An attempt to coerce to `string` may result in either the string itself (if the input data is indeed a string) or an `InvalidCoercion` error.

```typescript
import { string, coerceTo } from '@gucciogucci/contented';

coerceTo(string, 'hello');
// 'hello'

coerceTo(string, 42);
// InvalidCoercion { expected: 'string', got: 42 }
```

#### `number`

A run-time representation of the `number` type. An attempt to coerce to `number` may result in either the number itself (if the input data is indeed a number) or an `InvalidCoercion` error.

```typescript
import { number, coerceTo } from '@gucciogucci/contented';

coerceTo(number, 42);
// 42

coerceTo(number, 'hello');
// InvalidCoercion { expected: 'number', got: 'hello' }
```

#### `boolean`

A run-time representation of the `boolean` type. An attempt to coerce to `boolean` may result in either the boolean itself (if the input data is indeed a boolean) or an `InvalidCoercion` error.

```typescript
import { boolean, coerceTo } from '@gucciogucci/contented';

coerceTo(boolean, true);
// true

coerceTo(boolean, 'hello');
// InvalidCoercion { expected: 'boolean', got: 'hello' }
```

### Object types

#### `at(path, T)`

Constructs a run-time type that expects the input data to be an object such that there exists a value of type `T` under the keys specified in `path`.

```typescript
import { string, at, coerceTo } from '@gucciogucci/contented';

const stringAtAB = at(['a', 'b'], string)

coerceTo(stringAtAB, { a: { b: 'hello' } });
// 'hello'

coerceTo(stringAtAB, { a: { c: 'hello' } });
// MissingKey { missingKey: [ 'a', 'b' ] }

coerceTo(stringAtAB, 'hello');
// InvalidCoercion { expected: 'object', got: 'hello' }
```

When the path consists of a single key, such a key can be supplied without the need of enclosing it in an array.

```typescript
coerceTo(at('a', string), { a: 'hello' })
// 'hello'
```

#### `fallback(T, substitute)`

`fallback` works in tandem with `at` to provide a fallback value in case the input data does not contain the specified keys. Apart from removing the possibility of a `MissingKey` error, `fallback` retains the same behavior as the `at` it wraps.

```typescript
import { number, at, fallback, coerceTo } from '@gucciogucci/contented';

const numberAtAB = fallback(at(['a', 'b'], number), 42);

coerceTo(numberAtAB, { a: { c: 3 } });
// 42

coerceTo(numberAtAB, { a: { b: 3 } });
// 3
```

### Array types

#### `arrayOf(T)`

A run-time representation of an array of `T`s, where `T` denotes the run-time representation of its element type.

```typescript
import { number, arrayOf, coerceTo } from '@gucciogucci/contented';

coerceTo(arrayOf(number), [3, 4, 5]);
// [ 3, 4, 5 ]

coerceTo(arrayOf(number), 'hello');
// InvalidCoercion { expected: 'array', got: 'hello' }

coerceTo(arrayOf(number), [3, 'a', 5]);
// AtKey { atKey: [ 1 ], error: InvalidCoercion { expected: 'number', got: 'a' } }
```

#### `permissiveArrayOf(T)`

A run-time representation of an array of `T`s, where `T` denotes the run-time representation of its element type.

The distinctive feature of a `permissiveArrayOf(T)` is that it skips elements that are not recognized as `T`. This is different from `arrayOf(T)`, which instead stops as soon as one element is not recognized.

```typescript
import { number, permissiveArrayOf, coerceTo } from '@gucciogucci/contented';

coerceTo(permissiveArrayOf(number), [3, 4, 5]);
// [ 3, 4, 5 ]

coerceTo(permissiveArrayOf(number), [3, 'a', 5]);
/* [
     [ 3, 5 ],
     [ AtKey { atKey: [ 1 ], error: InvalidCoercion { expected: 'number', got: 'a' } } ]
   ]
*/
```

### Narrowing

#### `match(value)`

A run-time representation of the narrowest type that can be constructed from `value`. Hence, coercions to `match(value)` succeed only when `value` is provided as an input.

```typescript
import { match, coerceTo } from '@gucciogucci/contented';

coerceTo(match('hello'), 'hello');
// 'hello'

coerceTo(match('hello'), 'foo');
// InvalidCoercion { expected: 'hello', got: 'foo' }
```

#### `always(value)`

A run-time type that always succeeds with `value` regardless of the input data.

```typescript
import { always, coerceTo } from '@gucciogucci/contented';

coerceTo(always(20), 'hello');
// 20

coerceTo(always(20), false);
// 20
```

### Combinations & Alternatives

#### `combine(fn, ...Ts)`

`combine` constructs a run-time type from some known run-time types `Ts` and a function `fn`. Coercing to `combine(fn, ...Ts)` results in an attempt to coerce the input data to each type specified in `Ts`; if every coercion ends up successful, the resulting values are passed to the function `fn`.

```typescript
import { combine, string, coerceTo } from '@gucciogucci/contented';

const User = combine(
  (name, surname, phone) => ({ fullname: `${name} ${surname}`, phone }),
  at('name', string),
  at('surname', string),
  at(['contacts', 'phone'], string)
);

coerceTo(User, {
  name: 'John',
  surname: 'Smith',
  contacts: {
    phone: '055-123404',
    email: 'john@smith.com',
  }
});
// { fullname: 'John Smith', phone: '055-123404' }

coerceTo(User, { name: 42 });
// AtKey { atKey: [ 'name' ], error: InvalidCoercion { expected: 'string', got: 42 } }
```

#### `T1.or(T2)`

A run-time representation of the union type `T1 | T2`. In case of a failed coercion, the result encloses the errors coming from both `T1` and `T2`.

```typescript
import { string, number, at, coerceTo } from '@gucciogucci/contented';

coerceTo(string.or(number), 'hello');
// 'hello'

coerceTo(string.or(number), true);
/* Joint {
    errors: [
      InvalidCoercion { expected: 'string', got: true },
      InvalidCoercion { expected: 'number', got: true }
    ]
   }
*/

coerceTo(string.or(at('a', number)), { a: true });
/* Joint {
     errors: [
       InvalidCoercion { expected: 'string', got: { a: true } },
       AtKey { atKey: [ 'a' ], InvalidCoercion { expected: 'number', got: true } }
     ]
   }
*/
```

### Errors

#### `InvalidCoercion`
When the input data does not conform to the expected primitive type, `coerceTo` returns a `InvalidCoercion`, which contains both the expectation and the actual value.

```typescript
import { string, coerceTo } from '@gucciogucci/contented';

coerceTo(string, 42);
// InvalidCoercion { expected: 'string', got: 42 }
```
#### `AtKey<InvalidCoercion>`

An `InvalidCoercion` error, together with the path at which to find the non-conforming data.

```typescript
import { number, arrayOf, at, coerceTo } from '@gucciogucci/contented';

coerceTo(at('x', number), { x: 'hello' });
// AtKey { atKey: [ 'x' ], error: InvalidCoercion { expected: 'number', got: 'hello' } }


coerceTo(arrayOf(number), [3, 'a', 5]);
// AtKey { atKey: [ 1 ], error: InvalidCoercion { expected: 'number', got: 'a' } }
```

#### `MissingKey`

The path at which a non-existing key in the input data was instead expected.

```typescript
import { number, at, coerceTo } from '@gucciogucci/contented';

coerceTo(at('x', number), { y: 12 });
// MissingKey { missingKey: [ 'x' ] }
```

#### `Joint<[...Errs]>`

When multiple alternatives are provided but none of them is applicable to the input data, `coerceTo` returns a `Joint` error, reporting the errors resulting from the different failed attempts.

```typescript
import { string, number, coerceTo } from '@gucciogucci/contented';

coerceTo(string.or(number), true);
/* Joint {
    errors: [
      InvalidCoercion { expected: 'string', got: true },
      InvalidCoercion { expected: 'number', got: true }
    ]
   }
*/
```

## License

Copyright 2022 Gucci.

Licensed under the [GNU Lesser General Public License, Version 3.0](http://www.gnu.org/licenses/lgpl.txt)
