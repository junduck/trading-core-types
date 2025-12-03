import { describe, it, expect } from "vitest";
import {
  AssetSchema,
  MarketSnapshotSchema,
  MarketQuoteSchema,
  MarketBarSchema,
  OrderSchema,
  OrderStateSchema,
  FillSchema,
  LongPositionSchema,
  ShortPositionSchema,
  PositionSchema,
  toWireAsset,
  toWireMarketSnapshot,
  toWireMarketQuote,
  toWireMarketBar,
  toWireOrder,
  toWireOrderState,
  toWireFill,
  toWireLongPosition,
  toWireShortPosition,
  toWirePosition,
} from "../src/index";

describe("Schema serdes", () => {
  describe("Asset", () => {
    it("should serialize and deserialize with dates", () => {
      const now = new Date();
      const later = new Date(now.getTime() + 86400000);

      const runtime = AssetSchema.parse({
        symbol: "BTCUSDT",
        currency: "USDT",
        validFrom: now.getTime(),
        validUntil: later.getTime(),
      });

      expect(runtime.symbol).toBe("BTCUSDT");
      expect(runtime.validFrom).toEqual(now);
      expect(runtime.validUntil).toEqual(later);

      const wire = toWireAsset(runtime);
      expect(wire.validFrom).toBe(now.getTime());
      expect(wire.validUntil).toBe(later.getTime());
    });
  });

  describe("MarketSnapshot", () => {
    it("should handle Map serialization", () => {
      const now = new Date();

      const runtime = MarketSnapshotSchema.parse({
        price: { BTCUSDT: 50000, ETHUSDT: 3000 },
        timestamp: now.getTime(),
      });

      expect(runtime.price).toBeInstanceOf(Map);
      expect(runtime.price.get("BTCUSDT")).toBe(50000);
      expect(runtime.timestamp).toEqual(now);

      const wire = toWireMarketSnapshot(runtime);
      expect(wire.price).toEqual({ BTCUSDT: 50000, ETHUSDT: 3000 });
      expect(wire.timestamp).toBe(now.getTime());
    });
  });

  describe("MarketQuote", () => {
    it("should round-trip correctly", () => {
      const now = new Date();

      const wire = {
        symbol: "BTCUSDT",
        price: 50000,
        volume: 100,
        timestamp: now.getTime(),
        bid: 49999,
        bidVol: 10,
        ask: 50001,
        askVol: 20,
      };

      const runtime = MarketQuoteSchema.parse(wire);
      expect(runtime.timestamp).toEqual(now);

      const backToWire = toWireMarketQuote(runtime);
      expect(backToWire).toEqual(wire);
    });
  });

  describe("MarketBar", () => {
    it("should preserve all OHLCV data", () => {
      const now = new Date();

      const runtime = MarketBarSchema.parse({
        symbol: "BTCUSDT",
        open: 50000,
        high: 51000,
        low: 49000,
        close: 50500,
        volume: 1000,
        timestamp: now.getTime(),
        interval: "1h",
      });

      expect(runtime.timestamp).toEqual(now);
      expect(runtime.interval).toBe("1h");

      const wire = toWireMarketBar(runtime);
      expect(wire.timestamp).toBe(now.getTime());
    });
  });

  describe("Order", () => {
    it("should handle discriminated union for OrderAction", () => {
      const now = new Date();

      const runtime = OrderSchema.parse({
        id: "order-1",
        symbol: "BTCUSDT",
        side: "BUY",
        effect: "OPEN_LONG",
        type: "LIMIT",
        quantity: 1,
        price: 50000,
        created: now.getTime(),
      });

      expect(runtime.side).toBe("BUY");
      expect(runtime.effect).toBe("OPEN_LONG");
      expect(runtime.created).toEqual(now);

      const wire = toWireOrder(runtime);
      expect(wire.created).toBe(now.getTime());
    });
  });

  describe("OrderState", () => {
    it("should handle both created and modified dates", () => {
      const created = new Date();
      const modified = new Date(created.getTime() + 1000);

      const runtime = OrderStateSchema.parse({
        id: "order-1",
        symbol: "BTCUSDT",
        side: "SELL",
        effect: "CLOSE_LONG",
        type: "MARKET",
        quantity: 1,
        created: created.getTime(),
        filledQuantity: 0.5,
        remainingQuantity: 0.5,
        status: "PARTIAL",
        modified: modified.getTime(),
      });

      expect(runtime.created).toEqual(created);
      expect(runtime.modified).toEqual(modified);

      const wire = toWireOrderState(runtime);
      expect(wire.created).toBe(created.getTime());
      expect(wire.modified).toBe(modified.getTime());
    });
  });

  describe("Fill", () => {
    it("should serialize fill data", () => {
      const now = new Date();

      const runtime = FillSchema.parse({
        id: "fill-1",
        orderId: "order-1",
        symbol: "BTCUSDT",
        side: "BUY",
        effect: "OPEN_LONG",
        quantity: 1,
        price: 50000,
        commission: 10,
        created: now.getTime(),
      });

      expect(runtime.created).toEqual(now);

      const wire = toWireFill(runtime);
      expect(wire.created).toBe(now.getTime());
    });
  });

  describe("Position", () => {
    it("should handle nested Map structures", () => {
      const now = new Date();

      const longPos = LongPositionSchema.parse({
        quantity: 10,
        totalCost: 500000,
        realisedPnL: 1000,
        lots: [{ quantity: 10, price: 50000, totalCost: 500000 }],
        modified: now.getTime(),
      });

      const shortPos = ShortPositionSchema.parse({
        quantity: 5,
        totalProceeds: 150000,
        realisedPnL: -500,
        lots: [{ quantity: 5, price: 30000, totalProceeds: 150000 }],
        modified: now.getTime(),
      });

      const runtime = PositionSchema.parse({
        cash: 10000,
        long: { BTCUSDT: toWireLongPosition(longPos) },
        short: { ETHUSDT: toWireShortPosition(shortPos) },
        totalCommission: 100,
        realisedPnL: 500,
        modified: now.getTime(),
      });

      expect(runtime.long).toBeInstanceOf(Map);
      expect(runtime.short).toBeInstanceOf(Map);
      expect(runtime.long?.get("BTCUSDT")?.quantity).toBe(10);
      expect(runtime.short?.get("ETHUSDT")?.quantity).toBe(5);

      const wire = toWirePosition(runtime);
      expect(wire.long?.BTCUSDT.quantity).toBe(10);
      expect(wire.short?.ETHUSDT.quantity).toBe(5);
    });
  });
});
