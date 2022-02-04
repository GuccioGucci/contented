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
