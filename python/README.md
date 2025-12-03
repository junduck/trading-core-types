# trading-core-serdes

Python implementation of trading-core types with Pydantic validation and JSON serialization.

## Features

- Pydantic models for all trading types
- Wire format (JSON-compatible) types with camelCase fields
- Runtime types with snake_case fields and datetime objects
- Full validation and type checking
- Easy conversion between wire and runtime formats

## Types

- Asset
- MarketSnapshot
- MarketQuote
- MarketBar
- Order & OrderState
- Fill
- Position (Long/Short)

## Usage

```python
from trading_core import Asset, AssetWire

# Parse wire format (from JSON/API)
asset_wire = AssetWire.model_validate({
    "symbol": "AAPL",
    "currency": "USD",
    "validFrom": 1609459200000
})

# Convert to runtime format
asset = Asset.from_wire(asset_wire)

# Convert back to wire format
wire_data = asset.to_wire()
```
