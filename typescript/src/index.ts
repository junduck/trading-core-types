import { z } from "zod";

/**
 * Helper for epoch millisecond timestamp fields.
 * Transforms wire number (ms since epoch) to runtime Date.
 */
export const epochDate = z.number().transform((ms) => new Date(ms));

/**
 * Converts Date to epoch milliseconds for wire transmission.
 */
export function dateToWire(date: Date): number {
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

export const AssetSchema = AssetWireSchema.transform((data) => ({
  symbol: data.symbol,
  type: data.type,
  name: data.name,
  exchange: data.exchange,
  currency: data.currency,
  lotSize: data.lotSize,
  tickSize: data.tickSize,
  validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
  validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
}));

export type Asset = z.infer<typeof AssetSchema>;

export function toWireAsset(asset: Asset): AssetWire {
  return {
    symbol: asset.symbol,
    type: asset.type,
    name: asset.name,
    exchange: asset.exchange,
    currency: asset.currency,
    lotSize: asset.lotSize,
    tickSize: asset.tickSize,
    validFrom: asset.validFrom?.getTime(),
    validUntil: asset.validUntil?.getTime(),
  };
}

// ============================================================================
// MarketSnapshot
// ============================================================================

export const MarketSnapshotWireSchema = z.object({
  price: z.record(z.string(), z.number()),
  timestamp: z.number(),
});

export type MarketSnapshotWire = z.infer<typeof MarketSnapshotWireSchema>;

export const MarketSnapshotSchema = MarketSnapshotWireSchema.transform(
  (data) => ({
    price: new Map(Object.entries(data.price)),
    timestamp: new Date(data.timestamp),
  })
);

export type MarketSnapshot = z.infer<typeof MarketSnapshotSchema>;

export function toWireMarketSnapshot(
  snapshot: MarketSnapshot
): MarketSnapshotWire {
  return {
    price: Object.fromEntries(snapshot.price),
    timestamp: snapshot.timestamp.getTime(),
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

export const MarketQuoteSchema = MarketQuoteWireSchema.transform((data) => ({
  symbol: data.symbol,
  price: data.price,
  volume: data.volume,
  totalVolume: data.totalVolume,
  timestamp: new Date(data.timestamp),
  bid: data.bid,
  bidVol: data.bidVol,
  ask: data.ask,
  askVol: data.askVol,
  preClose: data.preClose,
}));

export type MarketQuote = z.infer<typeof MarketQuoteSchema>;

export function toWireMarketQuote(quote: MarketQuote): MarketQuoteWire {
  return {
    symbol: quote.symbol,
    price: quote.price,
    volume: quote.volume,
    totalVolume: quote.totalVolume,
    timestamp: quote.timestamp.getTime(),
    bid: quote.bid,
    bidVol: quote.bidVol,
    ask: quote.ask,
    askVol: quote.askVol,
    preClose: quote.preClose,
  };
}

// ============================================================================
// MarketBar
// ============================================================================

export const MarketBarInterval = z.enum([
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
]);

export const MarketBarWireSchema = z.object({
  symbol: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  timestamp: z.number(),
  interval: MarketBarInterval,
});

export type MarketBarWire = z.infer<typeof MarketBarWireSchema>;

export const MarketBarSchema = MarketBarWireSchema.transform((data) => ({
  symbol: data.symbol,
  open: data.open,
  high: data.high,
  low: data.low,
  close: data.close,
  volume: data.volume,
  timestamp: new Date(data.timestamp),
  interval: data.interval,
}));

export type MarketBar = z.infer<typeof MarketBarSchema>;

export function toWireMarketBar(bar: MarketBar): MarketBarWire {
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

// ============================================================================
// Order Types
// ============================================================================

export const OrderType = z.enum(["MARKET", "LIMIT", "STOP", "STOP_LIMIT"]);

export const OrderStatus = z.enum([
  "PENDING",
  "OPEN",
  "PARTIAL",
  "FILLED",
  "CANCELLED",
  "REJECT",
]);

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
    type: OrderType,
    quantity: z.number(),
    price: z.number().optional(),
    stopPrice: z.number().optional(),
    created: z.number().optional(),
  })
);

export type OrderWire = z.infer<typeof OrderWireSchema>;

export const OrderSchema = OrderWireSchema.transform((data) => ({
  ...data,
  created: data.created ? new Date(data.created) : undefined,
}));

export type Order = z.infer<typeof OrderSchema>;

export function toWireOrder(order: Order): OrderWire {
  return {
    ...order,
    created: order.created?.getTime(),
  };
}

// Partial Order schema for amendments and updates
export const PartialOrderWireSchema = z.object({
  id: z.string(),
  side: z.enum(["BUY", "SELL"]).optional(),
  effect: z
    .enum(["OPEN_LONG", "CLOSE_SHORT", "CLOSE_LONG", "OPEN_SHORT"])
    .optional(),
  symbol: z.string().optional(),
  type: OrderType.optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
  stopPrice: z.number().optional(),
  created: z.number().optional(),
});

export type PartialOrderWire = z.infer<typeof PartialOrderWireSchema>;

export const PartialOrderSchema = PartialOrderWireSchema.transform((data) => ({
  ...data,
  created: data.created ? new Date(data.created) : undefined,
}));

export type PartialOrder = z.infer<typeof PartialOrderSchema>;

export function toWirePartialOrder(order: PartialOrder): PartialOrderWire {
  return {
    ...order,
    created: order.created?.getTime(),
  };
}

// ============================================================================
// OrderState
// ============================================================================

export const OrderStateWireSchema = OrderWireSchema.and(
  z.object({
    filledQuantity: z.number(),
    remainingQuantity: z.number(),
    status: OrderStatus,
    modified: z.number(),
  })
);

export type OrderStateWire = z.infer<typeof OrderStateWireSchema>;

export const OrderStateSchema = OrderStateWireSchema.transform((data) => ({
  ...data,
  created: data.created ? new Date(data.created) : undefined,
  modified: new Date(data.modified),
}));

export type OrderState = z.infer<typeof OrderStateSchema>;

export function toWireOrderState(state: OrderState): OrderStateWire {
  return {
    ...state,
    created: state.created?.getTime(),
    modified: state.modified.getTime(),
  };
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

export const FillSchema = FillWireSchema.transform((data) => ({
  ...data,
  created: new Date(data.created),
}));

export type Fill = z.infer<typeof FillSchema>;

export function toWireFill(fill: Fill): FillWire {
  return {
    ...fill,
    created: fill.created.getTime(),
  };
}

// ============================================================================
// Position Types
// ============================================================================

export const LongPositionLot = z.object({
  quantity: z.number(),
  price: z.number(),
  totalCost: z.number(),
});

export const LongPositionWireSchema = z.object({
  quantity: z.number(),
  totalCost: z.number(),
  realisedPnL: z.number(),
  lots: z.array(LongPositionLot),
  modified: z.number(),
});

export type LongPositionWire = z.infer<typeof LongPositionWireSchema>;

export const LongPositionSchema = LongPositionWireSchema.transform((data) => ({
  quantity: data.quantity,
  totalCost: data.totalCost,
  realisedPnL: data.realisedPnL,
  lots: data.lots,
  modified: new Date(data.modified),
}));

export type LongPosition = z.infer<typeof LongPositionSchema>;

export function toWireLongPosition(pos: LongPosition): LongPositionWire {
  return {
    quantity: pos.quantity,
    totalCost: pos.totalCost,
    realisedPnL: pos.realisedPnL,
    lots: pos.lots,
    modified: pos.modified.getTime(),
  };
}

export const ShortPositionLot = z.object({
  quantity: z.number(),
  price: z.number(),
  totalProceeds: z.number(),
});

export const ShortPositionWireSchema = z.object({
  quantity: z.number(),
  totalProceeds: z.number(),
  realisedPnL: z.number(),
  lots: z.array(ShortPositionLot),
  modified: z.number(),
});

export type ShortPositionWire = z.infer<typeof ShortPositionWireSchema>;

export const ShortPositionSchema = ShortPositionWireSchema.transform(
  (data) => ({
    quantity: data.quantity,
    totalProceeds: data.totalProceeds,
    realisedPnL: data.realisedPnL,
    lots: data.lots,
    modified: new Date(data.modified),
  })
);

export type ShortPosition = z.infer<typeof ShortPositionSchema>;

export function toWireShortPosition(pos: ShortPosition): ShortPositionWire {
  return {
    quantity: pos.quantity,
    totalProceeds: pos.totalProceeds,
    realisedPnL: pos.realisedPnL,
    lots: pos.lots,
    modified: pos.modified.getTime(),
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

export const PositionSchema = PositionWireSchema.transform((data) => ({
  cash: data.cash,
  long: data.long
    ? new Map(
        Object.entries(data.long).map(([k, v]) => [
          k,
          LongPositionSchema.parse(v),
        ])
      )
    : undefined,
  short: data.short
    ? new Map(
        Object.entries(data.short).map(([k, v]) => [
          k,
          ShortPositionSchema.parse(v),
        ])
      )
    : undefined,
  totalCommission: data.totalCommission,
  realisedPnL: data.realisedPnL,
  modified: new Date(data.modified),
}));

export type Position = z.infer<typeof PositionSchema>;

export function toWirePosition(pos: Position): PositionWire {
  return {
    cash: pos.cash,
    long: pos.long
      ? Object.fromEntries(
          Array.from(pos.long.entries()).map(([k, v]) => [
            k,
            toWireLongPosition(v),
          ])
        )
      : undefined,
    short: pos.short
      ? Object.fromEntries(
          Array.from(pos.short.entries()).map(([k, v]) => [
            k,
            toWireShortPosition(v),
          ])
        )
      : undefined,
    totalCommission: pos.totalCommission,
    realisedPnL: pos.realisedPnL,
    modified: pos.modified.getTime(),
  };
}

export const CloseStrategy = z.enum(["FIFO", "LIFO"]);
