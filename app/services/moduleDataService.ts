import { useUserStore } from "@/store";
import { useLocationStore } from "@/store";
import { useDriverStore } from "@/store";

// Enhanced priority levels for data loading
export enum DataPriority {
  CRITICAL_BLOCKING = 1, // Must load first, blocks everything (auth, permissions)
  CRITICAL_PARALLEL = 2, // Critical but can load in parallel with others
  HIGH = 3, // Important but can wait
  MEDIUM = 4, // Nice to have
  LOW = 5, // Optional, load only if time permits
  BACKGROUND = 6, // Load in background, don't block transitions
}

// Enhanced data loading task interface
interface DataTask {
  id: string;
  name: string;
  priority: DataPriority;
  loader: () => Promise<any>;
  required: boolean; // If true, failure blocks transition
  timeout?: number; // Timeout in ms (default: 10000)
  cacheable?: boolean; // If true, result can be cached
  dependencies?: string[]; // Task IDs this task depends on
  retryCount?: number; // Number of retries on failure (default: 1)
}

// Module data loading result
interface ModuleDataResult {
  success: boolean;
  data: Record<string, any>;
  errors: string[];
  loadedItems: string[];
}

// Simple cache for data loading results
class DataCache {
  private static instance: DataCache;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  private constructor() {}

  static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void { // 5 minutes default TTL
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Optimized queue system for managing data loading
class DataLoadingQueue {
  private queue: DataTask[] = [];
  private isProcessing = false;
  private results: Record<string, any> = {};
  private errors: string[] = [];
  private cache = DataCache.getInstance();

  // Helper function to execute task with timeout and retry logic
  private async executeTaskWithRetry(task: DataTask, maxRetries: number = 1): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check cache first if task is cacheable
        if (task.cacheable) {
          const cached = this.cache.get(task.id);
          if (cached !== null) {
            console.log(`[DataLoadingQueue] 📋 Cache hit for: ${task.name}`);
            return cached;
          }
        }

        // Create timeout promise
        const timeout = task.timeout || 10000; // 10 seconds default
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Task timeout after ${timeout}ms`)), timeout);
        });

        // Execute task with timeout
        const result = await Promise.race([task.loader(), timeoutPromise]);

        // Cache result if cacheable
        if (task.cacheable) {
          this.cache.set(task.id, result);
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`[DataLoadingQueue] Attempt ${attempt + 1} failed for ${task.name}:`, lastError.message);

        if (attempt < maxRetries) {
          // Exponential backoff for retries
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error(`Task failed after ${maxRetries + 1} attempts`);
  }

  // Add task to queue
  addTask(task: DataTask): void {
    this.queue.push(task);
    // Sort by priority (lower number = higher priority)
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  // Optimized process all tasks in queue with intelligent parallel processing
  async processAll(
    onProgress?: (
      completed: number,
      total: number,
      currentTask: string,
    ) => void,
  ): Promise<ModuleDataResult> {
    if (this.isProcessing) {
      console.warn("[DataLoadingQueue] Already processing queue");
      return {
        success: false,
        data: {},
        errors: ["Queue already processing"],
        loadedItems: [],
      };
    }

    this.isProcessing = true;
    this.results = {};
    this.errors = [];
    this.cache.cleanup(); // Clean expired cache entries

    const totalTasks = this.queue.length;
    let completedTasks = 0;

    console.log(`[DataLoadingQueue] 🚀 Starting optimized processing of ${totalTasks} tasks`);

    // Process tasks in waves based on priority and dependencies
    const priorityGroups = this.groupTasksByPriorityAndDependencies();

    for (const [priority, tasks] of priorityGroups) {
      console.log(`[DataLoadingQueue] 📊 Processing priority ${priority} (${tasks.length} tasks)`);

      if (priority === DataPriority.CRITICAL_BLOCKING) {
        // Process blocking critical tasks sequentially
        for (const task of tasks) {
          try {
            onProgress?.(completedTasks, totalTasks, task.name);
            const result = await this.executeTaskWithRetry(task, task.retryCount);
            this.results[task.id] = result;
            completedTasks++;
            console.log(`[DataLoadingQueue] ✅ Blocking critical task completed: ${task.name}`);
          } catch (error) {
            const errorMsg = `Failed to load ${task.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
            console.error(`[DataLoadingQueue] ❌ ${errorMsg}`);
            this.errors.push(errorMsg);

            // Blocking critical tasks stop the entire process
            if (task.required) {
              this.isProcessing = false;
              return {
                success: false,
                data: this.results,
                errors: this.errors,
                loadedItems: Object.keys(this.results),
              };
            }
          }
        }
      } else {
        // Process non-blocking tasks in parallel
        const promises = tasks.map(async (task) => {
          try {
            // Wait for dependencies if any
            if (task.dependencies && task.dependencies.length > 0) {
              const missingDeps = task.dependencies.filter(dep => !this.results[dep]);
              if (missingDeps.length > 0) {
                throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
              }
            }

            const result = await this.executeTaskWithRetry(task, task.retryCount || 1);
            this.results[task.id] = result;
            completedTasks++;
            console.log(`[DataLoadingQueue] ✅ Parallel task completed: ${task.name}`);
            return { success: true, taskId: task.id, result };
          } catch (error) {
            const errorMsg = `Failed to load ${task.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
            console.error(`[DataLoadingQueue] ❌ ${errorMsg}`);
            this.errors.push(errorMsg);

            // For non-critical tasks, we don't fail the whole process unless required
            if (task.required && task.priority <= DataPriority.HIGH) {
              throw error;
            }

            return { success: false, taskId: task.id, error: errorMsg };
          }
        });

        try {
          await Promise.allSettled(promises);
        } catch (error) {
          // If a high-priority required task fails, stop the process
          this.isProcessing = false;
          return {
            success: false,
            data: this.results,
            errors: [...this.errors, error instanceof Error ? error.message : 'Unknown error'],
            loadedItems: Object.keys(this.results),
          };
        }

        // Update progress after each priority group
        onProgress?.(completedTasks, totalTasks, `Completando grupo prioridad ${priority}`);
      }
    }

    this.isProcessing = false;

    // Consider success if all required tasks completed
    const requiredTasks = this.queue.filter(task => task.required);
    const success = requiredTasks.every(task => this.results[task.id] !== undefined);

    console.log(`[DataLoadingQueue] 🎉 Processing complete. Success: ${success}, Completed: ${completedTasks}/${totalTasks}`);

    return {
      success,
      data: this.results,
      errors: this.errors,
      loadedItems: Object.keys(this.results),
    };
  }

  // Group tasks by priority considering dependencies
  private groupTasksByPriorityAndDependencies(): Map<DataPriority, DataTask[]> {
    const groups = new Map<DataPriority, DataTask[]>();
    const processed = new Set<string>();
    const pending = [...this.queue];

    // Initialize groups
    Object.values(DataPriority).forEach(priority => {
      if (typeof priority === 'number') {
        groups.set(priority, []);
      }
    });

    // Sort tasks by priority
    pending.sort((a, b) => a.priority - b.priority);

    for (const task of pending) {
      if (processed.has(task.id)) continue;

      // Check if all dependencies are processed
      const depsReady = !task.dependencies ||
        task.dependencies.every(dep => processed.has(dep) || this.results[dep]);

      if (depsReady) {
        const group = groups.get(task.priority) || [];
        group.push(task);
        groups.set(task.priority, group);
        processed.add(task.id);
      }
    }

    return groups;
  }

  // Clear the queue
  clear(): void {
    this.queue = [];
    this.results = {};
    this.errors = [];
    this.isProcessing = false;
  }

  // Get current progress
  getProgress(): { completed: number; total: number; currentTask?: string } {
    const completed = Object.keys(this.results).length;
    const total = this.queue.length;
    return { completed, total };
  }
}

// Singleton instance
const dataQueue = new DataLoadingQueue();

// Module Data Service
export class ModuleDataService {
  private static instance: ModuleDataService;

  private constructor() {}

  static getInstance(): ModuleDataService {
    if (!ModuleDataService.instance) {
      ModuleDataService.instance = new ModuleDataService();
    }
    return ModuleDataService.instance;
  }

  // Load driver-specific data with optimized priorities and caching
  async loadDriverData(
    onProgress?: (
      completed: number,
      total: number,
      currentTask: string,
    ) => void,
  ): Promise<ModuleDataResult> {
    console.log("[ModuleDataService] 🚗 Loading optimized driver data");

    dataQueue.clear();

    // Critical blocking data (must load first, blocks everything)
    dataQueue.addTask({
      id: "driver_auth_check",
      name: "Verificación de autenticación",
      priority: DataPriority.CRITICAL_BLOCKING,
      required: true,
      timeout: 5000,
      loader: async () => {
        const user = useUserStore.getState().user;
        if (!user) throw new Error("Usuario no autenticado");
        return { authenticated: true, userId: user.id };
      },
    });

    // Critical parallel data (can load simultaneously)
    dataQueue.addTask({
      id: "driver_profile",
      name: "Perfil de conductor",
      priority: DataPriority.CRITICAL_PARALLEL,
      required: true,
      timeout: 8000,
      cacheable: true,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const user = useUserStore.getState().user;
        if (!user) throw new Error("User not authenticated");
        return { ...user, role: "driver", verified: true };
      },
    });

    dataQueue.addTask({
      id: "vehicle_status",
      name: "Estado del vehículo",
      priority: DataPriority.CRITICAL_PARALLEL,
      required: true,
      timeout: 6000,
      cacheable: true,
      dependencies: ["driver_auth_check"], // Depends on auth check
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return {
          vehicleId: "V001",
          status: "available",
          fuel: 85,
          maintenance: "up_to_date",
          location: "available"
        };
      },
    });

    // High priority data
    dataQueue.addTask({
      id: "gps_location",
      name: "Ubicación GPS",
      priority: DataPriority.HIGH,
      required: false,
      timeout: 10000,
      cacheable: false, // Location changes frequently
      loader: async () => {
        const locationStore = useLocationStore.getState();
        if (locationStore.userLatitude && locationStore.userLongitude) {
          return {
            latitude: locationStore.userLatitude,
            longitude: locationStore.userLongitude,
            accuracy: 10,
            timestamp: Date.now()
          };
        }
        throw new Error("Ubicación no disponible");
      },
    });

    dataQueue.addTask({
      id: "driver_availability",
      name: "Disponibilidad",
      priority: DataPriority.HIGH,
      required: false,
      timeout: 3000,
      cacheable: false, // Status can change
      dependencies: ["vehicle_status"], // Needs vehicle to be available
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { status: "online", acceptRides: true, lastUpdate: Date.now() };
      },
    });

    // Medium priority data
    dataQueue.addTask({
      id: "ride_history",
      name: "Historial de viajes",
      priority: DataPriority.MEDIUM,
      required: false,
      timeout: 5000,
      cacheable: true,
      retryCount: 2,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          totalRides: 150,
          rating: 4.8,
          earnings: 2500,
          lastRide: "2024-01-15T10:30:00Z"
        };
      },
    });

    dataQueue.addTask({
      id: "driver_documents",
      name: "Documentos del conductor",
      priority: DataPriority.MEDIUM,
      required: false,
      timeout: 4000,
      cacheable: true,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return {
          license: "valid",
          insurance: "active",
          vehicleRegistration: "current"
        };
      },
    });

    // Low priority data (background loading)
    dataQueue.addTask({
      id: "driver_notifications",
      name: "Notificaciones pendientes",
      priority: DataPriority.LOW,
      required: false,
      timeout: 3000,
      cacheable: false,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { unreadCount: 3, urgentCount: 1 };
      },
    });

    return dataQueue.processAll(onProgress);
  }

  // Load business-specific data
  async loadBusinessData(
    onProgress?: (
      completed: number,
      total: number,
      currentTask: string,
    ) => void,
  ): Promise<ModuleDataResult> {
    console.log("[ModuleDataService] 🏢 Loading business data");

    dataQueue.clear();

    // Critical data (blocking)
    dataQueue.addTask({
      id: "business_profile",
      name: "Perfil del negocio",
      priority: DataPriority.CRITICAL_BLOCKING,
      required: true,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 700));
        const user = useUserStore.getState().user;
        if (!user) throw new Error("User not authenticated");
        return { ...user, businessType: "restaurant", verified: true };
      },
    });

    // High priority data
    dataQueue.addTask({
      id: "active_products",
      name: "Productos activos",
      priority: DataPriority.HIGH,
      required: false,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return {
          products: [
            { id: "P001", name: "Hamburguesa", price: 15.99, available: true },
            { id: "P002", name: "Pizza", price: 12.99, available: true },
          ],
        };
      },
    });

    dataQueue.addTask({
      id: "sales_stats",
      name: "Estadísticas de ventas",
      priority: DataPriority.HIGH,
      required: false,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return {
          todaySales: 250.5,
          weekSales: 1850.75,
          totalOrders: 45,
        };
      },
    });

    // Medium priority data
    dataQueue.addTask({
      id: "inventory",
      name: "Inventario",
      priority: DataPriority.MEDIUM,
      required: false,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          lowStock: ["Tomates", "Queso"],
          outOfStock: [],
          totalItems: 150,
        };
      },
    });

    dataQueue.addTask({
      id: "pending_orders",
      name: "Pedidos pendientes",
      priority: DataPriority.MEDIUM,
      required: false,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { pendingOrders: 3, urgentOrders: 1 };
      },
    });

    return dataQueue.processAll(onProgress);
  }

  // Load customer-specific data
  async loadCustomerData(
    onProgress?: (
      completed: number,
      total: number,
      currentTask: string,
    ) => void,
  ): Promise<ModuleDataResult> {
    console.log("[ModuleDataService] 👤 Loading customer data");

    dataQueue.clear();

    // Critical data (blocking)
    dataQueue.addTask({
      id: "customer_profile",
      name: "Perfil de usuario",
      priority: DataPriority.CRITICAL_BLOCKING,
      required: true,
      loader: async () => {
        const user = useUserStore.getState().user;
        if (!user) throw new Error("User not authenticated");
        return user;
      },
    });

    // High priority data
    dataQueue.addTask({
      id: "ride_history",
      name: "Historial de viajes",
      priority: DataPriority.HIGH,
      required: false,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          recentRides: [
            { id: "R001", date: "2024-01-15", amount: 25.5 },
            { id: "R002", date: "2024-01-14", amount: 18.75 },
          ],
          totalRides: 25,
        };
      },
    });

    dataQueue.addTask({
      id: "user_preferences",
      name: "Preferencias",
      priority: DataPriority.HIGH,
      required: false,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
          preferredPayment: "card",
          notifications: true,
          language: "es",
        };
      },
    });

    // Medium priority data
    dataQueue.addTask({
      id: "payment_methods",
      name: "Métodos de pago",
      priority: DataPriority.MEDIUM,
      required: false,
      loader: async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return {
          cards: [{ id: "C001", last4: "4242", brand: "visa", default: true }],
          balance: 15.75,
        };
      },
    });

    return dataQueue.processAll(onProgress);
  }

  // Utility method to get loading progress
  getLoadingProgress(): { completed: number; total: number } {
    return dataQueue.getProgress();
  }

  // Cancel current loading process
  cancelLoading(): void {
    dataQueue.clear();
  }
}

// Export singleton instance
export const moduleDataService = ModuleDataService.getInstance();

// Helper functions for easy access
export const loadDriverData = (
  onProgress?: (completed: number, total: number, currentTask: string) => void,
) => moduleDataService.loadDriverData(onProgress);

export const loadBusinessData = (
  onProgress?: (completed: number, total: number, currentTask: string) => void,
) => moduleDataService.loadBusinessData(onProgress);

export const loadCustomerData = (
  onProgress?: (completed: number, total: number, currentTask: string) => void,
) => moduleDataService.loadCustomerData(onProgress);
