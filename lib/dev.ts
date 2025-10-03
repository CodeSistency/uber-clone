import { useDevStore } from "@/store/dev/dev";

export const simulateLatency = async () => {
  const { developerMode, latencyMs } = useDevStore.getState();
  if (developerMode && latencyMs > 0) {
    await new Promise((r) => setTimeout(r, latencyMs));
  }
};

export const maybeFail = () => {
  const { developerMode, errorRate } = useDevStore.getState();
  if (developerMode && errorRate > 0 && Math.random() < errorRate) {
    throw new Error("Simulated error (developerMode)");
  }
};

type MockKey = `${"GET" | "POST" | "PUT" | "PATCH" | "DELETE"} ${string}`;

let mocks: Record<MockKey, any> = {};

export const registerMocks = (entries: Record<MockKey, any>) => {
  mocks = { ...mocks, ...entries };
};

export const maybeMockResponse = async (
  method: string,
  endpoint: string,
  body?: any,
) => {
  const { developerMode, networkBypass } = useDevStore.getState();
  if (!developerMode || !networkBypass) return null;

  const key: MockKey = `${method.toUpperCase()} ${endpoint}` as any;
  if (mocks[key]) {
    await simulateLatency();
    maybeFail();
    return typeof mocks[key] === "function"
      ? await mocks[key](body)
      : mocks[key];
  }
  return null;
};
