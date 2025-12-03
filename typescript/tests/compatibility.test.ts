import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import {
  AssetSchema,
  AssetWireSchema,
  FillSchema,
  FillWireSchema,
  MarketBarSchema,
  MarketBarWireSchema,
  MarketQuoteSchema,
  MarketQuoteWireSchema,
  OrderSchema,
  OrderStateSchema,
  OrderStateWireSchema,
  OrderWireSchema,
  PositionSchema,
  PositionWireSchema,
  toWireAsset,
  toWireFill,
  toWireMarketBar,
  toWireMarketQuote,
  toWireOrder,
  toWireOrderState,
  toWirePosition,
} from "../src/index.js";

const FIXTURES_DIR = resolve(__dirname, "../../fixtures");

function loadFixture(filename: string): unknown {
  const path = resolve(FIXTURES_DIR, filename);
  const content = readFileSync(path, "utf-8");
  return JSON.parse(content);
}

describe("Cross-language compatibility tests", () => {
  it("parses Asset wire format from Python", () => {
    const data = loadFixture("asset.json");
    const wire = AssetWireSchema.parse(data);

    expect(wire.symbol).toBe("AAPL");
    expect(wire.currency).toBe("USD");
    expect(wire.exchange).toBe("NASDAQ");
    expect(wire.lotSize).toBe(100);
    expect(wire.tickSize).toBe(0.01);
    expect(wire.validFrom).toBe(1609459200000);

    const asset = AssetSchema.parse(data);
    expect(asset.symbol).toBe("AAPL");
    expect(asset.validFrom).toBeInstanceOf(Date);
    expect(asset.validFrom?.getTime()).toBe(1609459200000);

    // Round-trip test
    const backToWire = toWireAsset(asset);
    expect(backToWire.symbol).toBe(wire.symbol);
    expect(backToWire.validFrom).toBe(wire.validFrom);
  });

  it("parses MarketQuote wire format from Python", () => {
    const data = loadFixture("market_quote.json");
    const wire = MarketQuoteWireSchema.parse(data);

    expect(wire.symbol).toBe("AAPL");
    expect(wire.price).toBe(150.25);
    expect(wire.volume).toBe(1000000);
    expect(wire.bid).toBe(150.2);
    expect(wire.ask).toBe(150.3);

    const quote = MarketQuoteSchema.parse(data);
    expect(quote.symbol).toBe("AAPL");
    expect(quote.price).toBe(150.25);
    expect(quote.timestamp).toBeInstanceOf(Date);

    // Round-trip test
    const backToWire = toWireMarketQuote(quote);
    expect(backToWire.symbol).toBe(wire.symbol);
    expect(backToWire.totalVolume).toBe(wire.totalVolume);
  });

  it("parses MarketBar wire format from Python", () => {
    const data = loadFixture("market_bar.json");
    const wire = MarketBarWireSchema.parse(data);

    expect(wire.symbol).toBe("GOOGL");
    expect(wire.open).toBe(2800.0);
    expect(wire.high).toBe(2850.0);
    expect(wire.low).toBe(2795.0);
    expect(wire.close).toBe(2835.5);
    expect(wire.interval).toBe("5m");

    const bar = MarketBarSchema.parse(data);
    expect(bar.symbol).toBe("GOOGL");
    expect(bar.close).toBe(2835.5);
    expect(bar.timestamp).toBeInstanceOf(Date);

    // Round-trip test
    const backToWire = toWireMarketBar(bar);
    expect(backToWire.interval).toBe(wire.interval);
  });

  it("parses Order wire format from Python", () => {
    const data = loadFixture("order.json");
    const wire = OrderWireSchema.parse(data);

    expect(wire.id).toBe("order-12345");
    expect(wire.symbol).toBe("TSLA");
    expect(wire.side).toBe("BUY");
    expect(wire.effect).toBe("OPEN_LONG");
    expect(wire.quantity).toBe(100);
    expect(wire.price).toBe(250.5);

    const order = OrderSchema.parse(data);
    expect(order.id).toBe("order-12345");
    expect(order.side).toBe("BUY");
    expect(order.created).toBeInstanceOf(Date);

    // Round-trip test
    const backToWire = toWireOrder(order);
    expect(backToWire.id).toBe(wire.id);
    expect(backToWire.side).toBe(wire.side);
  });

  it("parses OrderState wire format from Python", () => {
    const data = loadFixture("order_state.json");
    const wire = OrderStateWireSchema.parse(data);

    expect(wire.id).toBe("order-12345");
    expect(wire.filledQuantity).toBe(50);
    expect(wire.remainingQuantity).toBe(50);
    expect(wire.status).toBe("PARTIAL");

    const state = OrderStateSchema.parse(data);
    expect(state.filledQuantity).toBe(50);
    expect(state.status).toBe("PARTIAL");
    expect(state.modified).toBeInstanceOf(Date);

    // Round-trip test
    const backToWire = toWireOrderState(state);
    expect(backToWire.filledQuantity).toBe(wire.filledQuantity);
    expect(backToWire.status).toBe(wire.status);
  });

  it("parses Fill wire format from Python", () => {
    const data = loadFixture("fill.json");
    const wire = FillWireSchema.parse(data);

    expect(wire.id).toBe("fill-98765");
    expect(wire.orderId).toBe("order-12345");
    expect(wire.quantity).toBe(50);
    expect(wire.price).toBe(250.5);
    expect(wire.commission).toBe(2.5);

    const fill = FillSchema.parse(data);
    expect(fill.id).toBe("fill-98765");
    expect(fill.orderId).toBe("order-12345");
    expect(fill.created).toBeInstanceOf(Date);

    // Round-trip test
    const backToWire = toWireFill(fill);
    expect(backToWire.orderId).toBe(wire.orderId);
    expect(backToWire.commission).toBe(wire.commission);
  });

  it("parses Position wire format from Python", () => {
    const data = loadFixture("position.json");
    const wire = PositionWireSchema.parse(data);

    expect(wire.cash).toBe(50000.0);
    expect(wire.long).toBeDefined();
    expect(wire.long?.AAPL.quantity).toBe(100);
    expect(wire.long?.AAPL.lots).toHaveLength(2);
    expect(wire.short).toBeDefined();
    expect(wire.short?.TSLA.quantity).toBe(50);

    const position = PositionSchema.parse(data);
    expect(position.cash).toBe(50000.0);
    expect(position.long).toBeInstanceOf(Map);
    expect(position.long?.get("AAPL")?.quantity).toBe(100);
    expect(position.short).toBeInstanceOf(Map);
    expect(position.short?.get("TSLA")?.quantity).toBe(50);

    // Round-trip test
    const backToWire = toWirePosition(position);
    expect(backToWire.cash).toBe(wire.cash);
    expect(backToWire.totalCommission).toBe(wire.totalCommission);
    expect(backToWire.long?.AAPL.quantity).toBe(100);
    expect(backToWire.short?.TSLA.quantity).toBe(50);
  });

  it("serializes TypeScript data for Python consumption", () => {
    // Create a complex position in TypeScript
    const position = PositionSchema.parse({
      cash: 10000.0,
      long: {
        AAPL: {
          quantity: 100,
          totalCost: 15000.0,
          realisedPnL: 100.0,
          lots: [
            {
              quantity: 100,
              price: 150.0,
              totalCost: 15000.0,
            },
          ],
          modified: 1609459200000,
        },
      },
      short: {
        TSLA: {
          quantity: 50,
          totalProceeds: 12500.0,
          realisedPnL: -50.0,
          lots: [
            {
              quantity: 50,
              price: 250.0,
              totalProceeds: 12500.0,
            },
          ],
          modified: 1609459200000,
        },
      },
      totalCommission: 15.0,
      realisedPnL: 50.0,
      modified: 1609459200000,
    });

    // Serialize to wire format
    const wire = toWirePosition(position);

    // Verify camelCase keys (TypeScript/Python wire format convention)
    expect(wire).toHaveProperty("totalCommission");
    expect(wire).toHaveProperty("realisedPnL");
    expect(wire.long?.AAPL).toHaveProperty("totalCost");
    expect(wire.short?.TSLA).toHaveProperty("totalProceeds");

    // Verify timestamps are in milliseconds
    expect(typeof wire.modified).toBe("number");
    expect(wire.modified).toBe(1609459200000);

    // Verify JSON serialization works
    const jsonStr = JSON.stringify(wire);
    const parsed = JSON.parse(jsonStr);

    // Python can parse it back
    const parsedPosition = PositionSchema.parse(parsed);
    expect(parsedPosition.cash).toBe(position.cash);
    expect(parsedPosition.totalCommission).toBe(position.totalCommission);
  });

  it("handles timestamp conversions consistently", () => {
    const timestamp = 1609459200000; // 2021-01-01 00:00:00 UTC
    const expectedDate = new Date(timestamp);

    // Test with Asset
    const asset = AssetSchema.parse({
      symbol: "TEST",
      currency: "USD",
      validFrom: timestamp,
    });

    expect(asset.validFrom).toEqual(expectedDate);
    expect(toWireAsset(asset).validFrom).toBe(timestamp);

    // Test with MarketQuote
    const quote = MarketQuoteSchema.parse({
      symbol: "TEST",
      price: 100.0,
      timestamp,
    });

    expect(quote.timestamp).toEqual(expectedDate);
    expect(toWireMarketQuote(quote).timestamp).toBe(timestamp);
  });

  it("handles discriminated unions consistently", () => {
    // BUY order
    const buyOrder = OrderSchema.parse({
      id: "order-1",
      symbol: "TEST",
      side: "BUY",
      effect: "OPEN_LONG",
      type: "MARKET",
      quantity: 100,
    });

    expect(buyOrder.side).toBe("BUY");
    expect(buyOrder.effect).toBe("OPEN_LONG");

    // SELL order
    const sellOrder = OrderSchema.parse({
      id: "order-2",
      symbol: "TEST",
      side: "SELL",
      effect: "CLOSE_LONG",
      type: "MARKET",
      quantity: 50,
    });

    expect(sellOrder.side).toBe("SELL");
    expect(sellOrder.effect).toBe("CLOSE_LONG");

    // Verify wire format preserves discriminated union
    const sellWire = toWireOrder(sellOrder);
    expect(sellWire.side).toBe("SELL");
    expect(sellWire.effect).toBe("CLOSE_LONG");
  });
});
