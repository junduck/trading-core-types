# trading-core-types

Type validation and JSON serialization libraries for trading-core types, available in both TypeScript and Python.

## Packages

### TypeScript

**[@junduck/trading-core-serdes](typescript/)**

Zod validation and JSON serialization/deserialization for trading-core types.

```bash
npm install @junduck/trading-core-serdes
```

### Python

**[trading-core-types](python/)**

Pydantic models with wire/runtime format conversion for trading-core types.

```bash
pip install trading-core-types
```

## Features

Both packages provide:

- **Type-safe validation** using industry-standard libraries (Zod/Pydantic)
- **JSON serialization** for wire transport using standard JSON
- **Date handling** with automatic conversion to/from epoch timestamps
- **Consistent types** across TypeScript and Python environments

## License

MIT
