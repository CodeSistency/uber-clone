import { log } from "./logger";

/**
 * Room Tracking System
 * 
 * Maneja el seguimiento de rooms de WebSocket para optimizar
 * la gestión de conexiones y evitar duplicados.
 */
export interface RoomInfo {
  roomId: string;
  roomType: 'ride' | 'driver' | 'passenger' | 'general';
  joinedAt: Date;
  lastActivity: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface RoomTrackingStats {
  totalRooms: number;
  activeRooms: number;
  roomsByType: Record<string, number>;
  averageRoomDuration: number;
  longestActiveRoom: RoomInfo | null;
}

export class RoomTracker {
  private static instance: RoomTracker;
  private rooms: Map<string, RoomInfo> = new Map();
  private roomHistory: RoomInfo[] = [];
  private maxHistorySize = 1000;

  static getInstance(): RoomTracker {
    if (!RoomTracker.instance) {
      RoomTracker.instance = new RoomTracker();
    }
    return RoomTracker.instance;
  }

  /**
   * Join a room and track it
   */
  joinRoom(roomId: string, roomType: RoomInfo['roomType'], metadata?: Record<string, any>): void {
    const existingRoom = this.rooms.get(roomId);
    
    if (existingRoom) {
      // Update existing room
      existingRoom.lastActivity = new Date();
      existingRoom.isActive = true;
      existingRoom.metadata = { ...existingRoom.metadata, ...metadata };
      
      log.debug("Updated existing room", {
        component: "RoomTracker",
        action: "update_existing_room",
        data: {
          roomId,
          roomType,
          joinedAt: existingRoom.joinedAt,
          lastActivity: existingRoom.lastActivity,
        }
      });
    } else {
      // Create new room
      const roomInfo: RoomInfo = {
        roomId,
        roomType,
        joinedAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
        metadata,
      };

      this.rooms.set(roomId, roomInfo);
      
      log.info("Joined new room", {
        component: "RoomTracker",
        action: "join_new_room",
        data: {
          roomId,
          roomType,
          totalRooms: this.rooms.size,
          metadata,
        }
      });
    }
  }

  /**
   * Leave a room and mark it as inactive
   */
  leaveRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    
    if (room) {
      room.isActive = false;
      room.lastActivity = new Date();
      
      // Move to history
      this.roomHistory.unshift({ ...room });
      
      // Trim history if too large
      if (this.roomHistory.length > this.maxHistorySize) {
        this.roomHistory = this.roomHistory.slice(0, this.maxHistorySize);
      }
      
      log.info("Left room", {
        component: "RoomTracker",
        action: "left_room",
        data: {
          roomId,
          roomType: room.roomType,
          duration: Date.now() - room.joinedAt.getTime(),
          totalActiveRooms: this.getActiveRooms().length,
        }
      });
    } else {
      log.warn("Attempted to leave unknown room", {
        component: "RoomTracker",
        action: "leave_unknown_room",
        data: { roomId }
      });
    }
  }

  /**
   * Check if currently in a room
   */
  isInRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    return room ? room.isActive : false;
  }

  /**
   * Get all active rooms
   */
  getActiveRooms(): RoomInfo[] {
    return Array.from(this.rooms.values()).filter(room => room.isActive);
  }

  /**
   * Get rooms by type
   */
  getRoomsByType(roomType: RoomInfo['roomType']): RoomInfo[] {
    return this.getActiveRooms().filter(room => room.roomType === roomType);
  }

  /**
   * Get room information
   */
  getRoomInfo(roomId: string): RoomInfo | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Update room activity
   */
  updateRoomActivity(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room && room.isActive) {
      room.lastActivity = new Date();
    }
  }

  /**
   * Clean up inactive rooms older than specified time
   */
  cleanupInactiveRooms(maxAgeMinutes: number = 30): void {
    const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    let cleanedCount = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      if (!room.isActive && room.lastActivity < cutoffTime) {
        this.rooms.delete(roomId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      log.info("Cleaned up inactive rooms", {
        component: "RoomTracker",
        action: "cleanup_inactive_rooms",
        data: {
          cleanedCount,
          remainingRooms: this.rooms.size,
          maxAgeMinutes,
        }
      });
    }
  }

  /**
   * Get room tracking statistics
   */
  getStats(): RoomTrackingStats {
    const activeRooms = this.getActiveRooms();
    const roomsByType: Record<string, number> = {};

    // Count rooms by type
    activeRooms.forEach(room => {
      roomsByType[room.roomType] = (roomsByType[room.roomType] || 0) + 1;
    });

    // Calculate average room duration
    const now = Date.now();
    const totalDuration = activeRooms.reduce((sum, room) => {
      return sum + (now - room.joinedAt.getTime());
    }, 0);
    const averageRoomDuration = activeRooms.length > 0 ? totalDuration / activeRooms.length : 0;

    // Find longest active room
    const longestActiveRoom = activeRooms.reduce((longest, room) => {
      const roomDuration = now - room.joinedAt.getTime();
      const longestDuration = longest ? now - longest.joinedAt.getTime() : 0;
      return roomDuration > longestDuration ? room : longest;
    }, null as RoomInfo | null);

    return {
      totalRooms: this.rooms.size,
      activeRooms: activeRooms.length,
      roomsByType,
      averageRoomDuration,
      longestActiveRoom,
    };
  }

  /**
   * Get room history
   */
  getRoomHistory(limit?: number): RoomInfo[] {
    return limit ? this.roomHistory.slice(0, limit) : this.roomHistory;
  }

  /**
   * Clear all room data
   */
  clearAll(): void {
    const roomCount = this.rooms.size;
    this.rooms.clear();
    this.roomHistory = [];
    
    log.info("Cleared all room data", {
      component: "RoomTracker",
      action: "clear_all_room_data",
      data: { roomCount }
    });
  }

  /**
   * Get rooms that need activity update (inactive for too long)
   */
  getStaleRooms(maxInactivityMinutes: number = 5): RoomInfo[] {
    const cutoffTime = new Date(Date.now() - maxInactivityMinutes * 60 * 1000);
    return this.getActiveRooms().filter(room => room.lastActivity < cutoffTime);
  }

  /**
   * Force disconnect from all rooms
   */
  disconnectAllRooms(): string[] {
    const disconnectedRooms = Array.from(this.rooms.keys());
    
    for (const roomId of disconnectedRooms) {
      this.leaveRoom(roomId);
    }
    
    log.info("Disconnected from all rooms", {
      component: "RoomTracker",
      action: "disconnect_all_rooms",
      data: {
        disconnectedCount: disconnectedRooms.length,
      }
    });
    
    return disconnectedRooms;
  }

  /**
   * Get room summary for debugging
   */
  getDebugSummary(): string {
    const stats = this.getStats();
    const activeRooms = this.getActiveRooms();
    
    return `
Room Tracker Summary:
- Total Rooms: ${stats.totalRooms}
- Active Rooms: ${stats.activeRooms}
- Rooms by Type: ${JSON.stringify(stats.roomsByType)}
- Average Duration: ${Math.round(stats.averageRoomDuration / 1000)}s
- Longest Active: ${stats.longestActiveRoom?.roomId || 'None'}

Active Rooms:
${activeRooms.map(room => 
  `  - ${room.roomId} (${room.roomType}) - ${Math.round((Date.now() - room.joinedAt.getTime()) / 1000)}s`
).join('\n')}
    `.trim();
  }
}

// Export singleton instance
export const roomTracker = RoomTracker.getInstance();

// Auto-cleanup every 5 minutes
setInterval(() => {
  roomTracker.cleanupInactiveRooms(30); // Clean rooms inactive for 30+ minutes
}, 5 * 60 * 1000);
