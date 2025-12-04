import { z } from "zod";

// Import original definitions from trading-core
import type {
  Asset,
  MarketSnapshot,
  MarketQuote,
  MarketBar,
  Order,
  OrderState,
  Fill,
  Position,
} from "@junduck/trading-core";

import type {
  MarketBarInterval,
  OrderType,
  OrderStatus,
} from "@junduck/trading-core";

/**
 * Converts epoch milliseconds to Date.
 */
export function msToDate(ms: number): Date {
  return new Date(ms);
}

/**
 * Converts Date to epoch milliseconds.
 */
export function dateToMs(date: Date): number {
  return date.getTime();
}

// ============================================================================
// Asset
// ============================================================================

export const AssetWireSchema = z.object({
  symbol: z.string(),
  type: z.string().optional(),
  name: z.string().optional(),
  exchange: z.string().optional(),
  currency: z.string(),
  lotSize: z.number().optional(),
  tickSize: z.number().optional(),
  validFrom: z.number().optional(),
  validUntil: z.number().optional(),
});

export type AssetWire = z.infer<typeof AssetWireSchema>;

export function encodeAsset(asset: Asset): AssetWire {
  const wire: AssetWire = {
    symbol: asset.symbol,
    currency: asset.currency,
  };

  if (asset.type !== undefined) wire.type = asset.type;
  if (asset.name !== undefined) wire.name = asset.name;
  if (asset.exchange !== undefined) wire.exchange = asset.exchange;
  if (asset.lotSize !== undefined) wire.lotSize = asset.lotSize;
  if (asset.tickSize !== undefined) wire.tickSize = asset.tickSize;
  if (asset.validFrom !== undefined) wire.validFrom = dateToMs(asset.validFrom);
  if (asset.validUntil !== undefined)
    wire.validUntil = dateToMs(asset.validUntil);

  return wire;
}

export function decodeAsset(parsed: z.infer<typeof AssetWireSchema>): Asset {
  const asset: Asset = {
    symbol: parsed.symbol,
    currency: parsed.currency,
  };

  if (parsed.type !== undefined) asset.type = parsed.type;
  if (parsed.name !== undefined) asset.name = parsed.name;
  if (parsed.exchange !== undefined) asset.exchange = parsed.exchange;
  if (parsed.lotSize !== undefined) asset.lotSize = parsed.lotSize;
  if (parsed.tickSize !== undefined) asset.tickSize = parsed.tickSize;
  if (parsed.validFrom !== undefined)
    asset.validFrom = msToDate(parsed.validFrom);
  if (parsed.validUntil !== undefined)
    asset.validUntil = msToDate(parsed.validUntil);

  return asset;
}

// ============================================================================
// MarketSnapshot
// ============================================================================

export const MarketSnapshotWireSchema = z.object({
  price: z.record(z.string(), z.number()),
  timestamp: z.number(),
});

export type MarketSnapshotWire = z.infer<typeof MarketSnapshotWireSchema>;

export function encodeMarketSnapshot(
  snapshot: MarketSnapshot
): MarketSnapshotWire {
  return {
    price: Object.fromEntries(snapshot.price),
    timestamp: dateToMs(snapshot.timestamp),
  };
}

export function decodeMarketSnapshot(
  parsed: z.infer<typeof MarketSnapshotWireSchema>
): MarketSnapshot {
  return {
    price: new Map(Object.entries(parsed.price)),
    timestamp: msToDate(parsed.timestamp),
  };
}

// ============================================================================
// MarketQuote
// ============================================================================

export const MarketQuoteWireSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  volume: z.number().optional(),
  totalVolume: z.number().optional(),
  timestamp: z.number(),
  bid: z.number().optional(),
  bidVol: z.number().optional(),
  ask: z.number().optional(),
  askVol: z.number().optional(),
  preClose: z.number().optional(),
});

export type MarketQuoteWire = z.infer<typeof MarketQuoteWireSchema>;

export function encodeMarketQuote(quote: MarketQuote): MarketQuoteWire {
  const wire: MarketQuoteWire = {
    symbol: quote.symbol,
    price: quote.price,
    timestamp: dateToMs(quote.timestamp),
  };

  if (quote.volume !== undefined) wire.volume = quote.volume;
  if (quote.totalVolume !== undefined) wire.totalVolume = quote.totalVolume;
  if (quote.bid !== undefined) wire.bid = quote.bid;
  if (quote.bidVol !== undefined) wire.bidVol = quote.bidVol;
  if (quote.ask !== undefined) wire.ask = quote.ask;
  if (quote.askVol !== undefined) wire.askVol = quote.askVol;
  if (quote.preClose !== undefined) wire.preClose = quote.preClose;

  return wire;
}

export function decodeMarketQuote(
  parsed: z.infer<typeof MarketQuoteWireSchema>
): MarketQuote {
  const quote: MarketQuote = {
    symbol: parsed.symbol,
    price: parsed.price,
    timestamp: msToDate(parsed.timestamp),
  };

  if (parsed.volume !== undefined) quote.volume = parsed.volume;
  if (parsed.totalVolume !== undefined) quote.totalVolume = parsed.totalVolume;
  if (parsed.bid !== undefined) quote.bid = parsed.bid;
  if (parsed.bidVol !== undefined) quote.bidVol = parsed.bidVol;
  if (parsed.ask !== undefined) quote.ask = parsed.ask;
  if (parsed.askVol !== undefined) quote.askVol = parsed.askVol;
  if (parsed.preClose !== undefined) quote.preClose = parsed.preClose;

  return quote;
}

// ============================================================================
// MarketBar
// ============================================================================

export const MarketBarWireSchema = z.object({
  symbol: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  timestamp: z.number(),
  interval: z.enum([
    "1m",
    "5m",
    "15m",
    "30m",
    "1h",
    "2h",
    "4h",
    "1d",
    "1w",
    "1M",
  ]),
});

export type MarketBarWire = z.infer<typeof MarketBarWireSchema>;

export function encodeMarketBar(bar: MarketBar): MarketBarWire {
  return {
    symbol: bar.symbol,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    volume: bar.volume,
    timestamp: dateToMs(bar.timestamp),
    interval: bar.interval,
  };
}

export function decodeMarketBar(
  parsed: z.infer<typeof MarketBarWireSchema>
): MarketBar {
  return {
    symbol: parsed.symbol,
    open: parsed.open,
    high: parsed.high,
    low: parsed.low,
    close: parsed.close,
    volume: parsed.volume,
    timestamp: msToDate(parsed.timestamp),
    interval: parsed.interval as MarketBarInterval,
  };
}

// ============================================================================
// Order Types
// ============================================================================

const OrderActionWire = z.discriminatedUnion("side", [
  z.object({
    side: z.literal("BUY"),
    effect: z.enum(["OPEN_LONG", "CLOSE_SHORT"]),
  }),
  z.object({
    side: z.literal("SELL"),
    effect: z.enum(["CLOSE_LONG", "OPEN_SHORT"]),
  }),
]);

export const OrderWireSchema = OrderActionWire.and(
  z.object({
    id: z.string(),
    symbol: z.string(),
    type: z.enum(["MARKET", "LIMIT", "STOP", "STOP_LIMIT"]),
    quantity: z.number(),
    price: z.number().optional(),
    stopPrice: z.number().optional(),
    created: z.number().optional(),
  })
);

export type OrderWire = z.infer<typeof OrderWireSchema>;

export function encodeOrder(order: Order): OrderWire {
  const wire: any = {
    id: order.id,
    symbol: order.symbol,
    type: order.type as OrderType,
    quantity: order.quantity,
  };

  if (order.price !== undefined) wire.price = order.price;
  if (order.stopPrice !== undefined) wire.stopPrice = order.stopPrice;
  if (order.created !== undefined) wire.created = dateToMs(order.created);

  if (order.side === "BUY") {
    wire.side = "BUY" as const;
    wire.effect = order.effect as "OPEN_LONG" | "CLOSE_SHORT";
  } else {
    wire.side = "SELL" as const;
    wire.effect = order.effect as "CLOSE_LONG" | "OPEN_SHORT";
  }

  return wire as OrderWire;
}

export function decodeOrder(parsed: z.infer<typeof OrderWireSchema>): Order {
  const order: any = {
    id: parsed.id,
    symbol: parsed.symbol,
    type: parsed.type as OrderType,
    quantity: parsed.quantity,
  };

  if (parsed.price !== undefined) order.price = parsed.price;
  if (parsed.stopPrice !== undefined) order.stopPrice = parsed.stopPrice;
  if (parsed.created !== undefined) order.created = msToDate(parsed.created);

  if (parsed.side === "BUY") {
    order.side = "BUY" as const;
    order.effect = parsed.effect as "OPEN_LONG" | "CLOSE_SHORT";
  } else {
    order.side = "SELL" as const;
    order.effect = parsed.effect as "CLOSE_LONG" | "OPEN_SHORT";
  }

  return order as Order;
}

// Partial Order for amendments and updates
export interface PartialOrder {
  id: string;
  side?: "BUY" | "SELL";
  effect?: "OPEN_LONG" | "CLOSE_SHORT" | "CLOSE_LONG" | "OPEN_SHORT";
  symbol?: string;
  type?: OrderType;
  quantity?: number;
  price?: number;
  stopPrice?: number;
  created?: Date;
}

export const PartialOrderWireSchema = z.object({
  id: z.string(),
  side: z.enum(["BUY", "SELL"]).optional(),
  effect: z
    .enum(["OPEN_LONG", "CLOSE_SHORT", "CLOSE_LONG", "OPEN_SHORT"])
    .optional(),
  symbol: z.string().optional(),
  type: z.enum(["MARKET", "LIMIT", "STOP", "STOP_LIMIT"]).optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
  stopPrice: z.number().optional(),
  created: z.number().optional(),
});

export type PartialOrderWire = z.infer<typeof PartialOrderWireSchema>;

export function encodePartialOrder(order: PartialOrder): PartialOrderWire {
  const wire: PartialOrderWire = {
    id: order.id,
  };

  if (order.side !== undefined) wire.side = order.side;
  if (order.effect !== undefined) wire.effect = order.effect;
  if (order.symbol !== undefined) wire.symbol = order.symbol;
  if (order.type !== undefined) wire.type = order.type;
  if (order.quantity !== undefined) wire.quantity = order.quantity;
  if (order.price !== undefined) wire.price = order.price;
  if (order.stopPrice !== undefined) wire.stopPrice = order.stopPrice;
  if (order.created !== undefined) wire.created = dateToMs(order.created);

  return wire;
}

export function decodePartialOrder(
  parsed: z.infer<typeof PartialOrderWireSchema>
): PartialOrder {
  const order: PartialOrder = {
    id: parsed.id,
  };

  if (parsed.side !== undefined) order.side = parsed.side;
  if (parsed.effect !== undefined) order.effect = parsed.effect;
  if (parsed.symbol !== undefined) order.symbol = parsed.symbol;
  if (parsed.type !== undefined) order.type = parsed.type as OrderType;
  if (parsed.quantity !== undefined) order.quantity = parsed.quantity;
  if (parsed.price !== undefined) order.price = parsed.price;
  if (parsed.stopPrice !== undefined) order.stopPrice = parsed.stopPrice;
  if (parsed.created !== undefined) order.created = msToDate(parsed.created);

  return order;
}

// ============================================================================
// OrderState
// ============================================================================

export const OrderStateWireSchema = OrderActionWire.and(
  z.object({
    id: z.string(),
    symbol: z.string(),
    type: z.enum(["MARKET", "LIMIT", "STOP", "STOP_LIMIT"]),
    quantity: z.number(),
    price: z.number().optional(),
    stopPrice: z.number().optional(),
    created: z.number().optional(),
    filledQuantity: z.number(),
    remainingQuantity: z.number(),
    status: z.enum([
      "PENDING",
      "OPEN",
      "PARTIAL",
      "FILLED",
      "CANCELLED",
      "REJECT",
    ]),
    modified: z.number(),
  })
);

export type OrderStateWire = z.infer<typeof OrderStateWireSchema>;

export function encodeOrderState(state: OrderState): OrderStateWire {
  const baseWire: any = {
    id: state.id,
    symbol: state.symbol,
    type: state.type as OrderType,
    quantity: state.quantity,
    filledQuantity: state.filledQuantity,
    remainingQuantity: state.remainingQuantity,
    status: state.status as OrderStatus,
    modified: dateToMs(state.modified),
  };

  if (state.price !== undefined) baseWire.price = state.price;
  if (state.stopPrice !== undefined) baseWire.stopPrice = state.stopPrice;
  if (state.created !== undefined) baseWire.created = dateToMs(state.created);

  if (state.side === "BUY") {
    baseWire.side = "BUY" as const;
    baseWire.effect = state.effect as "OPEN_LONG" | "CLOSE_SHORT";
  } else {
    baseWire.side = "SELL" as const;
    baseWire.effect = state.effect as "CLOSE_LONG" | "OPEN_SHORT";
  }

  return baseWire as OrderStateWire;
}

export function decodeOrderState(
  parsed: z.infer<typeof OrderStateWireSchema>
): OrderState {
  const baseState: any = {
    id: parsed.id,
    symbol: parsed.symbol,
    type: parsed.type as OrderType,
    quantity: parsed.quantity,
    filledQuantity: parsed.filledQuantity,
    remainingQuantity: parsed.remainingQuantity,
    status: parsed.status as OrderStatus,
    modified: msToDate(parsed.modified),
  };

  if (parsed.price !== undefined) baseState.price = parsed.price;
  if (parsed.stopPrice !== undefined) baseState.stopPrice = parsed.stopPrice;
  if (parsed.created !== undefined)
    baseState.created = msToDate(parsed.created);

  if (parsed.side === "BUY") {
    baseState.side = "BUY" as const;
    baseState.effect = parsed.effect as "OPEN_LONG" | "CLOSE_SHORT";
  } else {
    baseState.side = "SELL" as const;
    baseState.effect = parsed.effect as "CLOSE_LONG" | "OPEN_SHORT";
  }

  return baseState as OrderState;
}

// ============================================================================
// Fill
// ============================================================================

export const FillWireSchema = OrderActionWire.and(
  z.object({
    id: z.string(),
    orderId: z.string(),
    symbol: z.string(),
    quantity: z.number(),
    price: z.number(),
    commission: z.number(),
    created: z.number(),
  })
);

export type FillWire = z.infer<typeof FillWireSchema>;

export function encodeFill(fill: Fill): FillWire {
  if (fill.side === "BUY") {
    return {
      id: fill.id,
      orderId: fill.orderId,
      symbol: fill.symbol,
      side: "BUY" as const,
      effect: fill.effect as "OPEN_LONG" | "CLOSE_SHORT",
      quantity: fill.quantity,
      price: fill.price,
      commission: fill.commission,
      created: dateToMs(fill.created),
    } as FillWire;
  } else {
    return {
      id: fill.id,
      orderId: fill.orderId,
      symbol: fill.symbol,
      side: "SELL" as const,
      effect: fill.effect as "CLOSE_LONG" | "OPEN_SHORT",
      quantity: fill.quantity,
      price: fill.price,
      commission: fill.commission,
      created: dateToMs(fill.created),
    } as FillWire;
  }
}

export function decodeFill(parsed: z.infer<typeof FillWireSchema>): Fill {
  if (parsed.side === "BUY") {
    return {
      side: "BUY",
      effect: parsed.effect as "OPEN_LONG" | "CLOSE_SHORT",
      id: parsed.id,
      orderId: parsed.orderId,
      symbol: parsed.symbol,
      quantity: parsed.quantity,
      price: parsed.price,
      commission: parsed.commission,
      created: msToDate(parsed.created),
    };
  } else {
    return {
      side: "SELL",
      effect: parsed.effect as "CLOSE_LONG" | "OPEN_SHORT",
      id: parsed.id,
      orderId: parsed.orderId,
      symbol: parsed.symbol,
      quantity: parsed.quantity,
      price: parsed.price,
      commission: parsed.commission,
      created: msToDate(parsed.created),
    };
  }
}

// ============================================================================
// Position Types
// ============================================================================

// Custom types for position lots (not exported from trading-core)
export interface LongPositionLot {
  quantity: number;
  price: number;
  totalCost: number;
}

export const LongPositionLotSchema = z.object({
  quantity: z.number(),
  price: z.number(),
  totalCost: z.number(),
});

export type LongPositionLotType = z.infer<typeof LongPositionLotSchema>;

export interface LongPosition {
  quantity: number;
  totalCost: number;
  realisedPnL: number;
  lots: LongPositionLotType[];
  modified: Date;
}

export const LongPositionWireSchema = z.object({
  quantity: z.number(),
  totalCost: z.number(),
  realisedPnL: z.number(),
  lots: z.array(LongPositionLotSchema),
  modified: z.number(),
});

export type LongPositionWire = z.infer<typeof LongPositionWireSchema>;

export function encodeLongPosition(pos: LongPosition): LongPositionWire {
  return {
    quantity: pos.quantity,
    totalCost: pos.totalCost,
    realisedPnL: pos.realisedPnL,
    lots: pos.lots,
    modified: dateToMs(pos.modified),
  };
}

export function decodeLongPosition(
  parsed: z.infer<typeof LongPositionWireSchema>
): LongPosition {
  return {
    quantity: parsed.quantity,
    totalCost: parsed.totalCost,
    realisedPnL: parsed.realisedPnL,
    lots: parsed.lots,
    modified: msToDate(parsed.modified),
  };
}

export interface ShortPositionLot {
  quantity: number;
  price: number;
  totalProceeds: number;
}

export const ShortPositionLotSchema = z.object({
  quantity: z.number(),
  price: z.number(),
  totalProceeds: z.number(),
});

export type ShortPositionLotType = z.infer<typeof ShortPositionLotSchema>;

export interface ShortPosition {
  quantity: number;
  totalProceeds: number;
  realisedPnL: number;
  lots: ShortPositionLotType[];
  modified: Date;
}

export const ShortPositionWireSchema = z.object({
  quantity: z.number(),
  totalProceeds: z.number(),
  realisedPnL: z.number(),
  lots: z.array(ShortPositionLotSchema),
  modified: z.number(),
});

export type ShortPositionWire = z.infer<typeof ShortPositionWireSchema>;

export function encodeShortPosition(pos: ShortPosition): ShortPositionWire {
  return {
    quantity: pos.quantity,
    totalProceeds: pos.totalProceeds,
    realisedPnL: pos.realisedPnL,
    lots: pos.lots,
    modified: dateToMs(pos.modified),
  };
}

export function decodeShortPosition(
  parsed: z.infer<typeof ShortPositionWireSchema>
): ShortPosition {
  return {
    quantity: parsed.quantity,
    totalProceeds: parsed.totalProceeds,
    realisedPnL: parsed.realisedPnL,
    lots: parsed.lots,
    modified: msToDate(parsed.modified),
  };
}

export const PositionWireSchema = z.object({
  cash: z.number(),
  long: z.record(z.string(), LongPositionWireSchema).optional(),
  short: z.record(z.string(), ShortPositionWireSchema).optional(),
  totalCommission: z.number(),
  realisedPnL: z.number(),
  modified: z.number(),
});

export type PositionWire = z.infer<typeof PositionWireSchema>;

export function encodePosition(pos: Position): PositionWire {
  const wire: PositionWire = {
    cash: pos.cash,
    totalCommission: pos.totalCommission,
    realisedPnL: pos.realisedPnL,
    modified: dateToMs(pos.modified),
  };

  if (pos.long) {
    wire.long = Object.fromEntries(
      Array.from(pos.long.entries()).map(([k, v]) => [k, encodeLongPosition(v)])
    );
  }

  if (pos.short) {
    wire.short = Object.fromEntries(
      Array.from(pos.short.entries()).map(([k, v]) => [
        k,
        encodeShortPosition(v),
      ])
    );
  }

  return wire;
}

export function decodePosition(
  parsed: z.infer<typeof PositionWireSchema>
): Position {
  const result: Position = {
    cash: parsed.cash,
    totalCommission: parsed.totalCommission,
    realisedPnL: parsed.realisedPnL,
    modified: msToDate(parsed.modified),
  };
  if (parsed.long) {
    result.long = new Map(
      Object.entries(parsed.long).map(([k, v]) => [k, decodeLongPosition(v)])
    );
  }
  if (parsed.short) {
    result.short = new Map(
      Object.entries(parsed.short).map(([k, v]) => [k, decodeShortPosition(v)])
    );
  }

  return result;
}
