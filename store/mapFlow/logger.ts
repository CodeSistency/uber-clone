export type LogLevel = "debug" | "info" | "warn" | "error";

let enabled = __DEV__;

export const setMapFlowLogging = (value: boolean) => {
  enabled = value;
};

export const mapFlowLogger = (level: LogLevel, message: string, payload?: unknown) => {
  if (!enabled) return;

  // eslint-disable-next-line no-console
  console[level](`[MapFlow] ${message}`, payload ?? "");
};


