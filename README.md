<div align="center">
  <img src="https://github.com/GuccioGucci/contented/blob/main/contented.svg?raw=true" width="250"/>
</div>

<p align="center">
  A library to coerce values at run-time.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@gucciogucci/contented"><img alt="NPM" src="https://badge.fury.io/js/@gucciogucci%2Fcontented.svg"/></a>
  <a href="https://github.com/GuccioGucci/contented/actions/workflows/test.yml"><img alt="Test" src="https://github.com/GuccioGucci/contented/actions/workflows/test.yml/badge.svg"></a>
  <a href="https://bundlephobia.com/package/@gucciogucci/contented"><img alt="Bundlephobia Minified" src="https://img.shields.io/bundlephobia/min/@gucciogucci/contented.svg"></a>
</p>

## Table of Contents

- [Introduction](#introduction)
- [Reference](#reference)
  - [Coercing](#coercing)
    - [`isValid(T, input)`](#isvalidt-input)
    - [`explain(T, input)`](#explaint-input)
  - [Primitive types](#primitive-types)
    - [`string`](#string)
    - [`number`](#number)
    - [`bigint`](#bigint)
    - [`boolean`](#boolean)
    - [`null_`](#null\_)
  - [Literal types](#literal-types)
    - [`literal`](#literal)
  - [Compound types](#compound-types)
    - [`object`](#object)
    - [`arrayOf(T)`](#arrayoft)
    - [`oneOf(T1, T2, ...Ts)`](#oneoft1-t2-ts)
    - [`allOf(T1, T2, ...Ts)`](#alloft1-t2-ts)
  - [Utility types](#utility-types)
    - [`Infer`](#infer)
- [License](#license)

## Introduction

Contented is a TypeScript library for performing type coercion at run-time. To this end, Contented introduces run-time representations of primitive types, such as `string`, which can be then mixed and matched to describe compound types.

```typescript
import { string, number, object } from '@gucciogucci/contented';

const Image = object({
  url: string,
  size: number
});
```

Contented may be useful every time there are expectations — but no real guarantees, on the shape of data acquired at run-time. Common use cases include processing data coming over the wire, from files, or any other external source.

## Reference

### Coercing

#### `isValid(T, input)`

A type-guard that returns `true` if `input` is evaluated to be a `T`, and `false` otherwise.

```typescript
import { number, object, isValid } from '@gucciogucci/contented';

const Point = object({
  x: number,
  y: number
});

if (isValid(Point, input)) {
  // here input: { x: number, y: number }
}
```

#### `explain(T, input)`

Explains why `input` cannot be coerced to `T`. It returns `undefined` if no explanation is needed, that is, if `input` is in fact a `T`.

```typescript
import { number, object, explain } from '@gucciogucci/contented';

const Point = object({
  x: number,
  y: number
});

explain(Point, { x: 10 });
/* {
     value: { x: 10 },
     isNot: { object: { x: 'number', y: 'number' } },
     since: [ { missingKey: 'y' } ]
   }
*/

explain(Point, { x: 'hello', y: 'there' })
/* {
     value: { x: 'hello', y: 'there' },
     isNot: { object: { x: 'number', y: 'number' } },
     since: [
       { atKey: 'x', value: 'hello', isNot: 'number' },
       { atKey: 'y', value: 'there', isNot: 'number' }
     ]
   }
*/

explain(Point, { x: 10, y : 20 });
// undefined
```

### Primitive types

#### `string`

A run-time representation of the `string` type.

```typescript
import { string, isValid, explain } from '@gucciogucci/contented';

isValid(string, 'hello');
// true

explain(string, 42);
// { value: 42, isNot: 'string' }
```

#### `number`

A run-time representation of the `number` type.

```typescript
import { number, isValid, explain } from '@gucciogucci/contented';

isValid(number, 42);
// true

explain(number, 'hello');
// { value: 'hello', isNot: 'number' }
```

#### `bigint`

A run-time representation of the `bigint` type.

```typescript
import { bigint, isValid, explain } from '@gucciogucci/contented';

isValid(bigint, 1024n);
// true

explain(bigint, 'hello');
// { value: 'hello', isNot: 'bigint' }
```

#### `boolean`

A run-time representation of the `boolean` type.

```typescript
import { boolean, isValid, explain } from '@gucciogucci/contented';

isValid(boolean, false);
// true

explain(boolean, 'hello');
// { value: 'hello', isNot: 'boolean' }
```

#### `null_`

A run-time representation of the `null` type. The trailing underscore is to avoid shadowing the built-in `null` value.

```typescript
import { null_, isValid, explain } from '@gucciogucci/contented';

isValid(null_, null);
// true

explain(null_, 'hello');
// { value: 'hello', isNot: 'null' }
```

### Literal types

#### `literal`

A run-time representation of the narrowest type that can be constructed from `value`. Hence, coercions to `literal(value)` succeed only when `value` is provided as an input.

```typescript
import { literal, isValid, explain } from '@gucciogucci/contented';

isValid(literal('hello'), 'hello');
// true

explain(literal('hello'), 'foo');
// { value: 'foo', isNot: { literal: 'hello' }  }
```

### Compound types

#### `object`

A run-time representation of an object.

```typescript
import { number, object, isValid, explain } from '@gucciogucci/contented';

const Point = object({ x: number, y: number });

isValid(Point, { x: 10, y : 20 });
// true

explain(Point, { x: 10 });
/* {
     value: { x: 10 },
     isNot: { object: { x: 'number', y: 'number' } },
     since: [ { missingKey: 'y' } ]
   }
*/
```

As with compile-time types, optional properties are marked by adding a `?` at the end of their names:

```typescript
import { number, object, isValid } from '@gucciogucci/contented';

const Point = object({ x: number, y: number, 'z?': number })

isValid(Point, { x: 10, y: 20 });
// true

isValid(Point, { x: 10, y: 20, z: 30 });
// true

isValid(Point, { x: 10, y: 20, z: undefined });
// true
```

#### `arrayOf(T)`

A run-time representation of an array of `T`s, where `T` denotes the run-time representation of its element type.

```typescript
import { number, arrayOf, isValid, explain } from '@gucciogucci/contented';

isValid(arrayOf(number), [ 3, 4, 5 ]);
// true

explain(arrayOf(number), 'hello');
// { value: 'hello', isNot: { arrayOf: 'number' } }

explain(arrayOf(number), [ 3, 'a', 5 ]);
/* {
     value: [ 3, 'a', 5 ],
     isNot: { arrayOf: 'number' },
     since: [ { atKey: 1, value: 'a', isNot: 'number' } ]
   }
*/
```

#### `oneOf(T1, T2, ...Ts)`

A run-time representation of the union type `T1 | T2 | ...Ts`.

```typescript
import { oneOf, literal, isValid, explain } from '@gucciogucci/contented';

const abc = oneOf(literal('a'), literal('b'), literal('c'));

isValid(abc, 'a');
// true

explain(abc, 'd');
/* {
     value: 'd',
     isNot: { oneOf: [ { literal: 'a' }, { literal: 'b' }, { literal: 'c' } ] },
     since: [
       { value: 'd', isNot: { literal: 'a' } },
       { value: 'd', isNot: { literal: 'b' } },
       { value: 'd', isNot: { literal: 'c' } }
     ]
   }
*/
```

#### `allOf(T1, T2, ...Ts)`

A run-time representation of the intersection type `T1 & T2 & ...Ts`.

```typescript
import { allOf, object, number, isValid, explain } from '@gucciogucci/contented';

const abObject = allOf(object({ a: number }), object({ b: number }));

isValid(abObject, { a: 10, b: 20 });
// true

explain(abObject, { a: 10 });
/* {
     value: { a: 10 },
     isNot: { allOf: [ { object: { a: 'number' } }, { object: { b: 'number' } } ] },
     since: [{
       value: { a: 10 },
       isNot: { object: { b: 'number' } },
       since: [ { missingKey: 'b' } ]
     }]
   }
*/
```

### Utility types

#### `Infer`

`Infer` comes in handy every time it is necessary to infer the compile-time type corresponding to some run-time representation `T`.

```typescript
import { Infer, string, object } from '@gucciogucci/contented';

const User = object({
  name: string,
  surname: string,
  contacts: object({ phone: string })
});

function fn(user: Infer<typeof User>) {
  // here, user: { name: string; surname: string; contacts: { phone: string } }
}
```

## License

Copyright 2024 Gucci.

Licensed under the [GNU Lesser General Public License, Version 3.0](http://www.gnu.org/licenses/lgpl.txt)
