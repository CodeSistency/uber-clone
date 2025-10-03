import {
  BaseModule,
  MetricsConfig,
  HealthStatus,
  PerformanceMetrics,
} from "./types";

export class MetricsMonitor implements BaseModule {
  private config: MetricsConfig;
  private metrics: PerformanceMetrics;
  private metricsTimer: ReturnType<typeof setInterval> | null = null;
  private startTime: Date;
  private connectionStartTime: Date | null = null;
  private messageLatencies: number[] = [];
  private errorCounts: Map<string, number> = new Map();
  private eventCounts: Map<string, number> = new Map();

  // Rolling window for averages (last 100 measurements)
  private maxLatencyHistory = 100;

  constructor(config: MetricsConfig) {
    this.config = config;
    this.startTime = new Date();

    this.metrics = {
      messagesSent: 0,
      messagesReceived: 0,
      connectionUptime: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastUpdated: new Date(),
    };
  }

  async initialize(): Promise<void> {
    console.log("[MetricsMonitor] Initializing metrics collection");

    if (this.config.enableMetrics) {
      this.startMetricsCollection();
    }
  }

  async destroy(): Promise<void> {
    console.log("[MetricsMonitor] Destroying metrics monitor");
    this.stopMetricsCollection();
    this.messageLatencies.length = 0;
    this.errorCounts.clear();
    this.eventCounts.clear();
  }

  getHealthStatus(): HealthStatus {
    const now = new Date();

    // Consider unhealthy if no updates in last 2x metrics interval
    const timeSinceLastUpdate =
      now.getTime() - this.metrics.lastUpdated.getTime();
    const isHealthy = timeSinceLastUpdate < this.config.metricsInterval * 2;

    return {
      healthy: isHealthy,
      lastCheck: now,
      error: !isHealthy ? "Metrics not updating" : undefined,
      details: {
        lastUpdated: this.metrics.lastUpdated,
        timeSinceLastUpdate,
        metricsEnabled: this.config.enableMetrics,
        collectionActive: this.metricsTimer !== null,
      },
    };
  }

  // Message tracking
  recordMessageSent(): void {
    this.metrics.messagesSent++;
    this.updateMetrics();
  }

  recordMessageReceived(): void {
    this.metrics.messagesReceived++;
    this.updateMetrics();
  }

  recordMessageLatency(latency: number): void {
    this.messageLatencies.push(latency);

    // Maintain rolling window
    if (this.messageLatencies.length > this.maxLatencyHistory) {
      this.messageLatencies.shift();
    }

    // Update average
    this.metrics.averageResponseTime =
      this.messageLatencies.reduce((sum, lat) => sum + lat, 0) /
      this.messageLatencies.length;
    this.updateMetrics();
  }

  // Error tracking
  recordError(errorType: string, error?: any): void {
    const currentCount = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, currentCount + 1);

    // Recalculate error rate
    const totalErrors = Array.from(this.errorCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalMessages =
      this.metrics.messagesSent + this.metrics.messagesReceived;
    this.metrics.errorRate =
      totalMessages > 0 ? (totalErrors / totalMessages) * 100 : 0;

    console.log(
      `[MetricsMonitor] Error recorded: ${errorType} (total: ${currentCount + 1})`,
    );
    this.updateMetrics();
  }

  // Event tracking
  recordEvent(eventType: string): void {
    const currentCount = this.eventCounts.get(eventType) || 0;
    this.eventCounts.set(eventType, currentCount + 1);
  }

  // Connection tracking
  recordConnectionStart(): void {
    this.connectionStartTime = new Date();
    console.log("[MetricsMonitor] Connection started");
  }

  recordConnectionEnd(): void {
    if (this.connectionStartTime) {
      const connectionDuration =
        Date.now() - this.connectionStartTime.getTime();
      this.metrics.connectionUptime += connectionDuration;
      this.connectionStartTime = null;
      console.log(
        `[MetricsMonitor] Connection ended, duration: ${connectionDuration}ms`,
      );
    }
    this.updateMetrics();
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Get detailed statistics
  getDetailedStats(): {
    metrics: PerformanceMetrics;
    errorBreakdown: Record<string, number>;
    eventBreakdown: Record<string, number>;
    latencyStats: {
      min: number;
      max: number;
      avg: number;
      p95: number;
      count: number;
    };
    uptimePercentage: number;
  } {
    const errorBreakdown: Record<string, number> = {};
    this.errorCounts.forEach((count, type) => {
      errorBreakdown[type] = count;
    });

    const eventBreakdown: Record<string, number> = {};
    this.eventCounts.forEach((count, type) => {
      eventBreakdown[type] = count;
    });

    // Calculate latency percentiles
    const sortedLatencies = [...this.messageLatencies].sort((a, b) => a - b);
    const latencyStats = {
      min: sortedLatencies.length > 0 ? sortedLatencies[0] : 0,
      max:
        sortedLatencies.length > 0
          ? sortedLatencies[sortedLatencies.length - 1]
          : 0,
      avg: this.metrics.averageResponseTime,
      p95:
        sortedLatencies.length > 0
          ? sortedLatencies[Math.floor(sortedLatencies.length * 0.95)]
          : 0,
      count: sortedLatencies.length,
    };

    // Calculate uptime percentage
    const totalRuntime = Date.now() - this.startTime.getTime();
    const uptimePercentage =
      totalRuntime > 0
        ? (this.metrics.connectionUptime / totalRuntime) * 100
        : 0;

    return {
      metrics: this.getMetrics(),
      errorBreakdown,
      eventBreakdown,
      latencyStats,
      uptimePercentage,
    };
  }

  // Reset metrics
  resetMetrics(): void {
    console.log("[MetricsMonitor] Resetting all metrics");

    this.metrics = {
      messagesSent: 0,
      messagesReceived: 0,
      connectionUptime: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastUpdated: new Date(),
    };

    this.messageLatencies.length = 0;
    this.errorCounts.clear();
    this.eventCounts.clear();
    this.connectionStartTime = null;

    this.updateMetrics();
  }

  // Export metrics (for logging/debugging)
  exportMetrics(): {
    timestamp: Date;
    period: {
      start: Date;
      duration: number;
    };
    performance: PerformanceMetrics;
    details: ReturnType<MetricsMonitor["getDetailedStats"]>;
  } {
    const now = new Date();

    return {
      timestamp: now,
      period: {
        start: this.startTime,
        duration: now.getTime() - this.startTime.getTime(),
      },
      performance: this.getMetrics(),
      details: this.getDetailedStats(),
    };
  }

  // Alert system (basic implementation)
  checkThresholds(): {
    warnings: string[];
    critical: string[];
  } {
    const warnings: string[] = [];
    const critical: string[] = [];

    // High error rate
    if (this.metrics.errorRate > 10) {
      critical.push(`High error rate: ${this.metrics.errorRate.toFixed(2)}%`);
    } else if (this.metrics.errorRate > 5) {
      warnings.push(
        `Elevated error rate: ${this.metrics.errorRate.toFixed(2)}%`,
      );
    }

    // High latency
    if (this.metrics.averageResponseTime > 5000) {
      critical.push(
        `High average latency: ${this.metrics.averageResponseTime.toFixed(0)}ms`,
      );
    } else if (this.metrics.averageResponseTime > 2000) {
      warnings.push(
        `Elevated latency: ${this.metrics.averageResponseTime.toFixed(0)}ms`,
      );
    }

    // Low uptime
    const uptimePercentage = this.getDetailedStats().uptimePercentage;
    if (uptimePercentage < 50) {
      critical.push(`Low connection uptime: ${uptimePercentage.toFixed(1)}%`);
    } else if (uptimePercentage < 80) {
      warnings.push(
        `Moderate connection uptime: ${uptimePercentage.toFixed(1)}%`,
      );
    }

    return { warnings, critical };
  }

  private startMetricsCollection(): void {
    console.log(
      `[MetricsMonitor] Starting metrics collection (interval: ${this.config.metricsInterval}ms)`,
    );

    this.metricsTimer = setInterval(() => {
      // Periodic cleanup of old data (if retention is configured)
      if (this.config.retentionPeriod > 0) {
        this.cleanupOldData();
      }

      // Check thresholds and log warnings
      const { warnings, critical } = this.checkThresholds();

      if (critical.length > 0) {
        console.error("[MetricsMonitor] Critical issues detected:", critical);
      }

      if (warnings.length > 0) {
        console.warn("[MetricsMonitor] Warnings:", warnings);
      }

      // Update last updated timestamp
      this.updateMetrics();
    }, this.config.metricsInterval);
  }

  private stopMetricsCollection(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
      console.log("[MetricsMonitor] Stopped metrics collection");
    }
  }

  private updateMetrics(): void {
    this.metrics.lastUpdated = new Date();
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;

    // In a more sophisticated implementation, we would clean up
    // timestamped data older than cutoffTime
    // For now, just ensure arrays don't grow indefinitely

    if (this.messageLatencies.length > this.maxLatencyHistory) {
      // Keep only the most recent measurements
      this.messageLatencies.splice(
        0,
        this.messageLatencies.length - this.maxLatencyHistory,
      );
    }
  }
}
