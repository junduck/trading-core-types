# @junduck/trading-core-types

TypeScript library providing Zod validation and serialization/deserialization for `@junduck/trading-core` types.

## Features

- **Type-safe validation**: Zod schemas for all trading-core types
- **JSON serdes**: Standard JSON serialization/deserialization for wire transport
- **Date handling**: Automatic conversion between `Date` objects and epoch timestamps
- **Consistent transport**: Ensures trading-core types are transmitted reliably and consistently

## Implementation

- All interfaces are kept up-to-date with current trading-core version
- All interfaces are declared directly in `index.ts` for easier discovery by coding agents
- Uses standard JSON format for maximum compatibility
- Non-trivial types (e.g., `Date` fields) are automatically converted to/from epoch timestamps during serdes
