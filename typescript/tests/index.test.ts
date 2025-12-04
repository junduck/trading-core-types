import { describe, it, expect } from "vitest";
import {
  AssetWireSchema,
  MarketSnapshotWireSchema,
  MarketQuoteWireSchema,
  MarketBarWireSchema,
  OrderWireSchema,
  OrderStateWireSchema,
  FillWireSchema,
  PositionWireSchema,
  encodeAsset,
  decodeAsset,
  encodeMarketSnapshot,
  decodeMarketSnapshot,
  encodeMarketQuote,
  decodeMarketQuote,
  encodeMarketBar,
  decodeMarketBar,
  encodeOrder,
  decodeOrder,
  encodeOrderState,
  decodeOrderState,
  encodeFill,
  decodeFill,
  encodePosition,
  decodePosition,
} from "../src/index";

describe("Schema serdes", () => {
  describe("Asset", () => {
    it("should serialize and deserialize with dates", () => {
      const now = new Date();
      const later = new Date(now.getTime() + 86400000);

      // Create test runtime object (simulating @junduck/trading-core Asset)
      const testAsset = {
        symbol: "BTCUSDT",
        currency: "USDT",
        validFrom: now,
        validUntil: later,
      };

      // Encode to wire format
      const wire = encodeAsset(testAsset);
      expect(wire.symbol).toBe("BTCUSDT");
      expect(wire.validFrom).toBe(now.getTime());
      expect(wire.validUntil).toBe(later.getTime());

      // Validate wire format with schema
      const validatedWire = AssetWireSchema.parse(wire);

      // Decode back to runtime object
      const runtime = decodeAsset(validatedWire);
      expect(runtime.symbol).toBe("BTCUSDT");
      expect(runtime.validFrom).toEqual(now);
      expect(runtime.validUntil).toEqual(later);
    });
  });

  describe("MarketSnapshot", () => {
    it("should handle Map serialization", () => {
      const now = new Date();

      // Create test runtime object (MarketSnapshot uses Map for price)
      const testSnapshot = {
        price: new Map([
          ["BTCUSDT", 50000],
          ["ETHUSDT", 3000],
        ]),
        timestamp: now,
      };

      // Encode to wire format (Map → Object)
      const wire = encodeMarketSnapshot(testSnapshot);
      expect(wire.price).toEqual({ BTCUSDT: 50000, ETHUSDT: 3000 });
      expect(wire.timestamp).toBe(now.getTime());

      // Validate wire format
      const validatedWire = MarketSnapshotWireSchema.parse(wire);

      // Decode back to runtime object (Object → Map)
      const runtime = decodeMarketSnapshot(validatedWire);
      expect(runtime.price).toBeInstanceOf(Map);
      expect(runtime.price.get("BTCUSDT")).toBe(50000);
      expect(runtime.price.get("ETHUSDT")).toBe(3000);
      expect(runtime.timestamp).toEqual(now);
    });
  });

  describe("MarketQuote", () => {
    it("should round-trip correctly", () => {
      const now = new Date();

      // Create test runtime object (MarketQuote uses Date for timestamp)
      const testQuote = {
        symbol: "BTCUSDT",
        price: 50000,
        volume: 100,
        timestamp: now,
        bid: 49999,
        bidVol: 10,
        ask: 50001,
        askVol: 20,
      };

      // Encode to wire format (Date → timestamp)
      const wire = encodeMarketQuote(testQuote);
      expect(wire.symbol).toBe("BTCUSDT");
      expect(wire.price).toBe(50000);
      expect(wire.timestamp).toBe(now.getTime());

      // Validate wire format
      const validatedWire = MarketQuoteWireSchema.parse(wire);

      // Decode back to runtime object (timestamp → Date)
      const runtime = decodeMarketQuote(validatedWire);
      expect(runtime.symbol).toBe("BTCUSDT");
      expect(runtime.price).toBe(50000);
      expect(runtime.timestamp).toEqual(now);
    });
  });

  describe("MarketBar", () => {
    it("should preserve all OHLCV data", () => {
      const now = new Date();

      // Create test runtime object (MarketBar uses Date for timestamp)
      const testBar = {
        symbol: "BTCUSDT",
        open: 50000,
        high: 51000,
        low: 49000,
        close: 50500,
        volume: 1000,
        timestamp: now,
        interval: "1h" as const,
      };

      // Encode to wire format (Date → timestamp)
      const wire = encodeMarketBar(testBar);
      expect(wire.symbol).toBe("BTCUSDT");
      expect(wire.open).toBe(50000);
      expect(wire.timestamp).toBe(now.getTime());
      expect(wire.interval).toBe("1h");

      // Validate wire format
      const validatedWire = MarketBarWireSchema.parse(wire);

      // Decode back to runtime object (timestamp → Date)
      const runtime = decodeMarketBar(validatedWire);
      expect(runtime.symbol).toBe("BTCUSDT");
      expect(runtime.open).toBe(50000);
      expect(runtime.timestamp).toEqual(now);
      expect(runtime.interval).toBe("1h");
    });
  });

  describe("Order", () => {
    it("should handle discriminated union for OrderAction", () => {
      const now = new Date();

      // Create test runtime object (Order uses Date for created)
      const testOrder = {
        id: "order-1",
        symbol: "BTCUSDT",
        side: "BUY" as const,
        effect: "OPEN_LONG" as const,
        type: "LIMIT" as const,
        quantity: 1,
        price: 50000,
        created: now,
      };

      // Encode to wire format (Date → timestamp)
      const wire = encodeOrder(testOrder);
      expect(wire.id).toBe("order-1");
      expect(wire.side).toBe("BUY");
      expect(wire.effect).toBe("OPEN_LONG");
      expect(wire.created).toBe(now.getTime());

      // Validate wire format
      const validatedWire = OrderWireSchema.parse(wire);

      // Decode back to runtime object (timestamp → Date)
      const runtime = decodeOrder(validatedWire);
      expect(runtime.id).toBe("order-1");
      expect(runtime.side).toBe("BUY");
      expect(runtime.effect).toBe("OPEN_LONG");
      expect(runtime.created).toEqual(now);
    });
  });

  describe("OrderState", () => {
    it("should handle both created and modified dates", () => {
      const created = new Date();
      const modified = new Date(created.getTime() + 1000);

      // Create test runtime object (OrderState uses Date for created/modified)
      const testOrderState = {
        id: "order-1",
        symbol: "BTCUSDT",
        side: "SELL" as const,
        effect: "CLOSE_LONG" as const,
        type: "MARKET" as const,
        quantity: 1,
        created: created,
        filledQuantity: 0.5,
        remainingQuantity: 0.5,
        status: "PARTIAL" as const,
        modified: modified,
      };

      // Encode to wire format (Date → timestamp)
      const wire = encodeOrderState(testOrderState);
      expect(wire.id).toBe("order-1");
      expect(wire.side).toBe("SELL");
      expect(wire.effect).toBe("CLOSE_LONG");
      expect(wire.created).toBe(created.getTime());
      expect(wire.modified).toBe(modified.getTime());

      // Validate wire format
      const validatedWire = OrderStateWireSchema.parse(wire);

      // Decode back to runtime object (timestamp → Date)
      const runtime = decodeOrderState(validatedWire);
      expect(runtime.id).toBe("order-1");
      expect(runtime.side).toBe("SELL");
      expect(runtime.effect).toBe("CLOSE_LONG");
      expect(runtime.created).toEqual(created);
      expect(runtime.modified).toEqual(modified);
    });
  });

  describe("Fill", () => {
    it("should serialize fill data", () => {
      const now = new Date();

      // Create test runtime object (Fill uses Date for created)
      const testFill = {
        id: "fill-1",
        orderId: "order-1",
        symbol: "BTCUSDT",
        side: "BUY" as const,
        effect: "OPEN_LONG" as const,
        quantity: 1,
        price: 50000,
        commission: 10,
        created: now,
      };

      // Encode to wire format (Date → timestamp)
      const wire = encodeFill(testFill);
      expect(wire.id).toBe("fill-1");
      expect(wire.side).toBe("BUY");
      expect(wire.effect).toBe("OPEN_LONG");
      expect(wire.created).toBe(now.getTime());

      // Validate wire format
      const validatedWire = FillWireSchema.parse(wire);

      // Decode back to runtime object (timestamp → Date)
      const runtime = decodeFill(validatedWire);
      expect(runtime.id).toBe("fill-1");
      expect(runtime.side).toBe("BUY");
      expect(runtime.effect).toBe("OPEN_LONG");
      expect(runtime.created).toEqual(now);
    });
  });

  describe("Position", () => {
    it("should handle nested Map structures", () => {
      const now = new Date();

      // Create test runtime objects (Position uses Date for modified, Map for positions)
      const longPos = {
        quantity: 10,
        totalCost: 500000,
        realisedPnL: 1000,
        lots: [{ quantity: 10, price: 50000, totalCost: 500000 }],
        modified: now,
      };

      const shortPos = {
        quantity: 5,
        totalProceeds: 150000,
        realisedPnL: -500,
        lots: [{ quantity: 5, price: 30000, totalProceeds: 150000 }],
        modified: now,
      };

      const testPosition = {
        cash: 10000,
        long: new Map([["BTCUSDT", longPos]]),
        short: new Map([["ETHUSDT", shortPos]]),
        totalCommission: 100,
        realisedPnL: 500,
        modified: now,
      };

      // Verify runtime structure
      expect(testPosition.long).toBeInstanceOf(Map);
      expect(testPosition.short).toBeInstanceOf(Map);
      expect(testPosition.long.get("BTCUSDT")?.quantity).toBe(10);
      expect(testPosition.short.get("ETHUSDT")?.quantity).toBe(5);

      // Encode to wire format (Map → Object, Date → timestamp)
      const wire = encodePosition(testPosition);
      expect(wire.cash).toBe(10000);
      expect(wire.long?.BTCUSDT.quantity).toBe(10);
      expect(wire.short?.ETHUSDT.quantity).toBe(5);
      expect(wire.modified).toBe(now.getTime());

      // Validate wire format
      const validatedWire = PositionWireSchema.parse(wire);

      // Decode back to runtime object (Object → Map, timestamp → Date)
      const runtime = decodePosition(validatedWire);
      expect(runtime.cash).toBe(10000);
      expect(runtime.long).toBeInstanceOf(Map);
      expect(runtime.short).toBeInstanceOf(Map);
      expect(runtime.long?.get("BTCUSDT")?.quantity).toBe(10);
      expect(runtime.short?.get("ETHUSDT")?.quantity).toBe(5);
      expect(runtime.modified).toEqual(now);
    });
  });
});
