import { z } from "zod";

import type {
  Asset,
  MarketSnapshot,
  MarketQuote,
  MarketBar,
  Order,
  OrderState,
  Fill,
  Position,
  LongPosition,
  ShortPosition,
  MarketBarInterval,
  OrderType,
  OrderStatus,
} from "@junduck/trading-core/trading";

// ============================================================================
// Asset
// ============================================================================

const AssetWireSchema = z.object({
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
  if (asset.validFrom !== undefined) wire.validFrom = asset.validFrom.getTime();
  if (asset.validUntil !== undefined)
    wire.validUntil = asset.validUntil.getTime();

  return wire;
}

export function decodeAsset(parsed: AssetWire): Asset {
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
    asset.validFrom = new Date(parsed.validFrom);
  if (parsed.validUntil !== undefined)
    asset.validUntil = new Date(parsed.validUntil);

  return asset;
}

export const assetSchema = {
  validate: (data: unknown) => AssetWireSchema.safeParse(data),
  encode: (asset: Asset) => encodeAsset(asset),
  decode: (wire: AssetWire) => decodeAsset(wire),
};

// ============================================================================
// MarketSnapshot
// ============================================================================

const MarketSnapshotWireSchema = z.object({
  price: z.record(z.string(), z.number()),
  timestamp: z.number(),
});

export type MarketSnapshotWire = z.infer<typeof MarketSnapshotWireSchema>;

export function encodeMarketSnapshot(
  snapshot: MarketSnapshot
): MarketSnapshotWire {
  return {
    price: Object.fromEntries(snapshot.price),
    timestamp: snapshot.timestamp.getTime(),
  };
}

export function decodeMarketSnapshot(
  parsed: MarketSnapshotWire
): MarketSnapshot {
  return {
    price: new Map(Object.entries(parsed.price)),
    timestamp: new Date(parsed.timestamp),
  };
}

export const marketSnapshotSchema = {
  validate: (data: unknown) => MarketSnapshotWireSchema.safeParse(data),
  encode: (snapshot: MarketSnapshot) => encodeMarketSnapshot(snapshot),
  decode: (wire: MarketSnapshotWire) => decodeMarketSnapshot(wire),
};

// ============================================================================
// MarketQuote
// ============================================================================

const MarketQuoteWireSchema = z.object({
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
    timestamp: quote.timestamp.getTime(),
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

export function decodeMarketQuote(parsed: MarketQuoteWire): MarketQuote {
  const quote: MarketQuote = {
    symbol: parsed.symbol,
    price: parsed.price,
    timestamp: new Date(parsed.timestamp),
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

export const marketQuoteSchema = {
  validate: (data: unknown) => MarketQuoteWireSchema.safeParse(data),
  encode: (quote: MarketQuote) => encodeMarketQuote(quote),
  decode: (wire: MarketQuoteWire) => decodeMarketQuote(wire),
};

// ============================================================================
// MarketBar
// ============================================================================

const MarketBarWireSchema = z.object({
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
    timestamp: bar.timestamp.getTime(),
    interval: bar.interval,
  };
}

export function decodeMarketBar(parsed: MarketBarWire): MarketBar {
  return {
    symbol: parsed.symbol,
    open: parsed.open,
    high: parsed.high,
    low: parsed.low,
    close: parsed.close,
    volume: parsed.volume,
    timestamp: new Date(parsed.timestamp),
    interval: parsed.interval as MarketBarInterval,
  };
}

export const marketBarSchema = {
  validate: (data: unknown) => MarketBarWireSchema.safeParse(data),
  encode: (bar: MarketBar) => encodeMarketBar(bar),
  decode: (wire: MarketBarWire) => decodeMarketBar(wire),
};

// ============================================================================
// Order Types
// ============================================================================

const OrderActionSchema = z.discriminatedUnion("side", [
  z.object({
    side: z.literal("BUY"),
    effect: z.enum(["OPEN_LONG", "CLOSE_SHORT"]),
  }),
  z.object({
    side: z.literal("SELL"),
    effect: z.enum(["CLOSE_LONG", "OPEN_SHORT"]),
  }),
]);

const OrderWireSchema = OrderActionSchema.and(
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
  if (order.created !== undefined) wire.created = order.created.getTime();

  if (order.side === "BUY") {
    wire.side = "BUY" as const;
    wire.effect = order.effect as "OPEN_LONG" | "CLOSE_SHORT";
  } else {
    wire.side = "SELL" as const;
    wire.effect = order.effect as "CLOSE_LONG" | "OPEN_SHORT";
  }

  return wire as OrderWire;
}

export function decodeOrder(parsed: OrderWire): Order {
  const order: any = {
    id: parsed.id,
    symbol: parsed.symbol,
    type: parsed.type as OrderType,
    quantity: parsed.quantity,
  };

  if (parsed.price !== undefined) order.price = parsed.price;
  if (parsed.stopPrice !== undefined) order.stopPrice = parsed.stopPrice;
  if (parsed.created !== undefined) order.created = new Date(parsed.created);

  if (parsed.side === "BUY") {
    order.side = "BUY" as const;
    order.effect = parsed.effect as "OPEN_LONG" | "CLOSE_SHORT";
  } else {
    order.side = "SELL" as const;
    order.effect = parsed.effect as "CLOSE_LONG" | "OPEN_SHORT";
  }

  return order as Order;
}

export const orderSchema = {
  validate: (data: unknown) => OrderWireSchema.safeParse(data),
  encode: (order: Order) => encodeOrder(order),
  decode: (wire: OrderWire) => decodeOrder(wire),
};

// ============================================================================
// Partial Order for amendments and updates
// ============================================================================

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

const PartialOrderWireSchema = z.object({
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
  if (order.created !== undefined) wire.created = order.created.getTime();

  return wire;
}

export function decodePartialOrder(parsed: PartialOrderWire): PartialOrder {
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
  if (parsed.created !== undefined) order.created = new Date(parsed.created);

  return order;
}

export const partialOrderSchema = {
  validate: (data: unknown) => PartialOrderWireSchema.safeParse(data),
  encode: (order: PartialOrder) => encodePartialOrder(order),
  decode: (wire: PartialOrderWire) => decodePartialOrder(wire),
};

// ============================================================================
// OrderState
// ============================================================================

const OrderStateWireSchema = OrderActionSchema.and(
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
  const wire: any = {
    id: state.id,
    symbol: state.symbol,
    type: state.type as OrderType,
    quantity: state.quantity,
    filledQuantity: state.filledQuantity,
    remainingQuantity: state.remainingQuantity,
    status: state.status as OrderStatus,
    modified: state.modified.getTime(),
  };

  if (state.price !== undefined) wire.price = state.price;
  if (state.stopPrice !== undefined) wire.stopPrice = state.stopPrice;
  if (state.created !== undefined) wire.created = state.created.getTime();

  if (state.side === "BUY") {
    wire.side = "BUY" as const;
    wire.effect = state.effect as "OPEN_LONG" | "CLOSE_SHORT";
  } else {
    wire.side = "SELL" as const;
    wire.effect = state.effect as "CLOSE_LONG" | "OPEN_SHORT";
  }

  return wire as OrderStateWire;
}

export function decodeOrderState(parsed: OrderStateWire): OrderState {
  const state: any = {
    id: parsed.id,
    symbol: parsed.symbol,
    type: parsed.type as OrderType,
    quantity: parsed.quantity,
    filledQuantity: parsed.filledQuantity,
    remainingQuantity: parsed.remainingQuantity,
    status: parsed.status as OrderStatus,
    modified: new Date(parsed.modified),
  };

  if (parsed.price !== undefined) state.price = parsed.price;
  if (parsed.stopPrice !== undefined) state.stopPrice = parsed.stopPrice;
  if (parsed.created !== undefined) state.created = new Date(parsed.created);

  if (parsed.side === "BUY") {
    state.side = "BUY" as const;
    state.effect = parsed.effect as "OPEN_LONG" | "CLOSE_SHORT";
  } else {
    state.side = "SELL" as const;
    state.effect = parsed.effect as "CLOSE_LONG" | "OPEN_SHORT";
  }

  return state as OrderState;
}

export const orderStateSchema = {
  validate: (data: unknown) => OrderStateWireSchema.safeParse(data),
  encode: (state: OrderState) => encodeOrderState(state),
  decode: (wire: OrderStateWire) => decodeOrderState(wire),
};

// ============================================================================
// Fill
// ============================================================================

const FillWireSchema = OrderActionSchema.and(
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
      created: fill.created.getTime(),
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
      created: fill.created.getTime(),
    } as FillWire;
  }
}

export function decodeFill(parsed: FillWire): Fill {
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
      created: new Date(parsed.created),
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
      created: new Date(parsed.created),
    };
  }
}

export const fillSchema = {
  validate: (data: unknown) => FillWireSchema.safeParse(data),
  encode: (fill: Fill) => encodeFill(fill),
  decode: (wire: FillWire) => decodeFill(wire),
};

// ============================================================================
// Position Types
// ============================================================================

const LongPositionLotSchema = z.object({
  quantity: z.number(),
  price: z.number(),
  totalCost: z.number(),
});

const LongPositionWireSchema = z.object({
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
    modified: pos.modified.getTime(),
  };
}

export function decodeLongPosition(parsed: LongPositionWire): LongPosition {
  return {
    quantity: parsed.quantity,
    totalCost: parsed.totalCost,
    realisedPnL: parsed.realisedPnL,
    lots: parsed.lots,
    modified: new Date(parsed.modified),
  };
}

export const longPositionSchema = {
  validate: (data: unknown) => LongPositionWireSchema.safeParse(data),
  encode: (pos: LongPosition) => encodeLongPosition(pos),
  decode: (wire: LongPositionWire) => decodeLongPosition(wire),
};

const ShortPositionLotSchema = z.object({
  quantity: z.number(),
  price: z.number(),
  totalProceeds: z.number(),
});

const ShortPositionWireSchema = z.object({
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
    modified: pos.modified.getTime(),
  };
}

export function decodeShortPosition(parsed: ShortPositionWire): ShortPosition {
  return {
    quantity: parsed.quantity,
    totalProceeds: parsed.totalProceeds,
    realisedPnL: parsed.realisedPnL,
    lots: parsed.lots,
    modified: new Date(parsed.modified),
  };
}

export const shortPositionSchema = {
  validate: (data: unknown) => ShortPositionWireSchema.safeParse(data),
  encode: (pos: ShortPosition) => encodeShortPosition(pos),
  decode: (wire: ShortPositionWire) => decodeShortPosition(wire),
};

// ============================================================================
// Position
// ============================================================================

const PositionWireSchema = z.object({
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
    modified: pos.modified.getTime(),
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

export function decodePosition(parsed: PositionWire): Position {
  const result: Position = {
    cash: parsed.cash,
    totalCommission: parsed.totalCommission,
    realisedPnL: parsed.realisedPnL,
    modified: new Date(parsed.modified),
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

export const positionSchema = {
  validate: (data: unknown) => PositionWireSchema.safeParse(data),
  encode: (pos: Position) => encodePosition(pos),
  decode: (wire: PositionWire) => decodePosition(wire),
};
