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
    - [`isValid(T, input)`](#isvalidt-input)
    - [`explain(T, input)`](#explaint-input)
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

Attempts to coerce the `input` data to the type represented by `T`. It returns `input` as a `T`, or `undefined` if the data cannot be coerced.

```typescript
import { number, object, coerceTo } from '@gucciogucci/contented';

const Point = object({
  x: number,
  y: number
});

const point = coerceTo(Point, { x: 10, y : 20 });
// point: { x: number, y : number }

const notAPoint = coerceTo(Point, 'hello');
// notAPoint: undefined
```

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
import { string, coerceTo, explain } from '@gucciogucci/contented';

coerceTo(string, 'hello');
// 'hello'

explain(string, 42);
// { value: 42, isNot: 'string' }
```

#### `number`

A run-time representation of the `number` type.

```typescript
import { number, coerceTo, explain } from '@gucciogucci/contented';

coerceTo(number, 42);
// 42

explain(number, 'hello');
// { value: 'hello', isNot: 'number' }
```

#### `boolean`

A run-time representation of the `boolean` type.

```typescript
import { boolean, coerceTo, explain } from '@gucciogucci/contented';

coerceTo(boolean, true);
// true

explain(boolean, 'hello');
// { value: 'hello', isNot: 'boolean' }
```

### Literal types

#### `literal`

A run-time representation of the narrowest type that can be constructed from `value`. Hence, coercions to `literal(value)` succeed only when `value` is provided as an input.

```typescript
import { literal, coerceTo, explain } from '@gucciogucci/contented';

coerceTo(literal('hello'), 'hello');
// 'hello'

explain(literal('hello'), 'foo');
// { value: 'foo', isNot: { literal: 'hello' }  }
```

### Compound types

#### `object`

A run-time representation of an object.

```typescript
import { number, object, coerceTo, explain } from '@gucciogucci/contented';

const Point = object({ x: number, y: number });

coerceTo(Point, { x: 10, y : 20 });
// { x: 10, y: 20 }

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
import { number, object, coerceTo } from '@gucciogucci/contented';

const Point = object({ x: number, y: number, 'z?': number })

coerceTo(Point, { x: 10, y: 20 });
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
import { number, arrayOf, coerceTo, explain } from '@gucciogucci/contented';

coerceTo(arrayOf(number), [ 3, 4, 5 ]);
// [ 3, 4, 5 ]

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
import { oneOf, match, coerceTo, explain } from '@gucciogucci/contented';

const abc = oneOf(literal('a'), literal('b'), literal('c'));

coerceTo(abc, 'a');
// 'a'

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

Copyright 2023 Gucci.

Licensed under the [GNU Lesser General Public License, Version 3.0](http://www.gnu.org/licenses/lgpl.txt)
