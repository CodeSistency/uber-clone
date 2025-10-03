import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DevStoreState {
  developerMode: boolean;
  networkBypass: boolean;
  wsBypass: boolean;
  latencyMs: number;
  errorRate: number; // 0..1
  setDeveloperMode: (v: boolean) => void;
  setNetworkBypass: (v: boolean) => void;
  setWsBypass: (v: boolean) => void;
  setLatencyMs: (v: number) => void;
  setErrorRate: (v: number) => void;
  loadFromStorage: () => Promise<void>;
}

const STORAGE_KEY = "dev_store_flags_v1";

export const useDevStore = create<DevStoreState>((set, get) => ({
  developerMode: false,
  networkBypass: false,
  wsBypass: false,
  latencyMs: 0,
  errorRate: 0,
  setDeveloperMode: (v) => {
    set({ developerMode: v });
    save();
  },
  setNetworkBypass: (v) => {
    set({ networkBypass: v });
    save();
  },
  setWsBypass: (v) => {
    set({ wsBypass: v });
    save();
  },
  setLatencyMs: (v) => {
    set({ latencyMs: Math.max(0, v) });
    save();
  },
  setErrorRate: (v) => {
    set({ errorRate: Math.min(1, Math.max(0, v)) });
    save();
  },
  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          developerMode: !!parsed.developerMode,
          networkBypass: !!parsed.networkBypass,
          wsBypass: !!parsed.wsBypass,
          latencyMs:
            typeof parsed.latencyMs === "number" ? parsed.latencyMs : 0,
          errorRate:
            typeof parsed.errorRate === "number" ? parsed.errorRate : 0,
        });
      }
    } catch {}
  },
}));

async function save() {
  try {
    const state = useDevStore.getState();
    const payload = {
      developerMode: state.developerMode,
      networkBypass: state.networkBypass,
      wsBypass: state.wsBypass,
      latencyMs: state.latencyMs,
      errorRate: state.errorRate,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}
