import { bench, describe } from "vitest";

interface TestData {
  a: number;
  b: string;
  c: Date;
}

interface SerializedEpoch {
  a: number;
  b: string;
  c: number;
}

interface SerializedString {
  a: number;
  b: string;
  c: string;
}

const ITEM_COUNT = 6000;

function createTestData(): TestData[] {
  const data: TestData[] = [];
  const baseTime = Date.now();

  for (let i = 0; i < ITEM_COUNT; i++) {
    data.push({
      a: Math.random() * 1000,
      b: `symbol_${i.toString().padStart(6, "0")}`,
      c: new Date(baseTime + i * 1000),
    });
  }

  return data;
}

describe("Date serialization/deserialization performance", () => {
  const testData = createTestData();

  describe("Wire size comparison", () => {
    bench("JSON.stringify with epoch", () => {
      const serialized: SerializedEpoch[] = testData.map((item) => ({
        a: item.a,
        b: item.b,
        c: item.c.getTime(),
      }));
      JSON.stringify(serialized);
    });

    bench("JSON.stringify with ISO string", () => {
      const serialized: SerializedString[] = testData.map((item) => ({
        a: item.a,
        b: item.b,
        c: item.c.toISOString(),
      }));
      JSON.stringify(serialized);
    });
  });

  describe("Serialization", () => {
    bench("serialize Date to epoch", () => {
      const result: SerializedEpoch[] = testData.map((item) => ({
        a: item.a,
        b: item.b,
        c: item.c.getTime(),
      }));
    });

    bench("serialize Date to ISO string", () => {
      const result: SerializedString[] = testData.map((item) => ({
        a: item.a,
        b: item.b,
        c: item.c.toISOString(),
      }));
    });
  });

  describe("Deserialization", () => {
    const epochData: SerializedEpoch[] = testData.map((item) => ({
      a: item.a,
      b: item.b,
      c: item.c.getTime(),
    }));

    const stringData: SerializedString[] = testData.map((item) => ({
      a: item.a,
      b: item.b,
      c: item.c.toISOString(),
    }));

    bench("deserialize epoch to Date", () => {
      const result: TestData[] = epochData.map((item) => ({
        a: item.a,
        b: item.b,
        c: new Date(item.c),
      }));
    });

    bench("deserialize ISO string to Date", () => {
      const result: TestData[] = stringData.map((item) => ({
        a: item.a,
        b: item.b,
        c: new Date(item.c),
      }));
    });
  });

  describe("Round-trip", () => {
    bench("round-trip with epoch", () => {
      const serialized: SerializedEpoch[] = testData.map((item) => ({
        a: item.a,
        b: item.b,
        c: item.c.getTime(),
      }));

      const deserialized: TestData[] = serialized.map((item) => ({
        a: item.a,
        b: item.b,
        c: new Date(item.c),
      }));
    });

    bench("round-trip with ISO string", () => {
      const serialized: SerializedString[] = testData.map((item) => ({
        a: item.a,
        b: item.b,
        c: item.c.toISOString(),
      }));

      const deserialized: TestData[] = serialized.map((item) => ({
        a: item.a,
        b: item.b,
        c: new Date(item.c),
      }));
    });
  });
});
