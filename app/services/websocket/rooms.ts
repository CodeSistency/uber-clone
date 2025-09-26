import { BaseModule, HealthStatus, RoomState } from './types';

export class RoomManager implements BaseModule {
  private rooms: Map<string, RoomState> = new Map();
  private roomEmitter: ((event: string, roomId: string, data?: any) => void) | null = null;

  constructor() {
    // Room manager is ready to use
  }

  async initialize(): Promise<void> {
    console.log('[RoomManager] Initializing room management system');
  }

  async destroy(): Promise<void> {
    console.log('[RoomManager] Destroying room management system');
    this.rooms.clear();
    this.roomEmitter = null;
  }

  getHealthStatus(): HealthStatus {
    const activeRooms = Array.from(this.rooms.values()).filter(room => room.isActive).length;
    const totalRooms = this.rooms.size;

    return {
      healthy: true, // Room manager is always healthy
      lastCheck: new Date(),
      details: {
        totalRooms,
        activeRooms,
        inactiveRooms: totalRooms - activeRooms,
      },
    };
  }

  // Set room event emitter (for external communication)
  setRoomEmitter(emitter: (event: string, roomId: string, data?: any) => void): void {
    this.roomEmitter = emitter;
    console.log('[RoomManager] Room emitter set');
  }

  // Join a room
  joinRoom(roomId: string): boolean {
    if (this.rooms.has(roomId)) {
      const existingRoom = this.rooms.get(roomId)!;
      if (existingRoom.isActive) {
        console.log(`[RoomManager] Already in room: ${roomId}`);
        return true; // Already joined
      } else {
        // Reactivate existing room
        existingRoom.isActive = true;
        existingRoom.joinedAt = new Date();
        console.log(`[RoomManager] Reactivated room: ${roomId}`);
      }
    } else {
      // Create new room
      const roomState: RoomState = {
        roomId,
        joinedAt: new Date(),
        memberCount: 1, // Assume we're the first member
        lastActivity: new Date(),
        isActive: true,
      };

      this.rooms.set(roomId, roomState);
      console.log(`[RoomManager] Joined new room: ${roomId}`);
    }

    // Emit room joined event
    this.emitRoomEvent('room_joined', roomId);
    return true;
  }

  // Leave a room
  leaveRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || !room.isActive) {
      console.log(`[RoomManager] Not in room or room inactive: ${roomId}`);
      return false;
    }

    room.isActive = false;
    room.lastActivity = new Date();

    console.log(`[RoomManager] Left room: ${roomId}`);

    // Emit room left event
    this.emitRoomEvent('room_left', roomId);
    return true;
  }

  // Leave all rooms
  leaveAllRooms(): void {
    const activeRooms = Array.from(this.rooms.entries()).filter(([, room]) => room.isActive);

    console.log(`[RoomManager] Leaving all rooms (${activeRooms.length} active)`);

    for (const [roomId] of activeRooms) {
      this.leaveRoom(roomId);
    }
  }

  // Check if in a room
  isInRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    return room?.isActive === true;
  }

  // Get room state
  getRoomState(roomId: string): RoomState | null {
    return this.rooms.get(roomId) || null;
  }

  // Get all rooms
  getAllRooms(): RoomState[] {
    return Array.from(this.rooms.values());
  }

  // Get active rooms
  getActiveRooms(): RoomState[] {
    return Array.from(this.rooms.values()).filter(room => room.isActive);
  }

  // Update room activity
  updateRoomActivity(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room && room.isActive) {
      room.lastActivity = new Date();
    }
  }

  // Update member count for a room (when receiving updates from server)
  updateMemberCount(roomId: string, count: number): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.memberCount = count;
      console.log(`[RoomManager] Updated member count for ${roomId}: ${count}`);
    }
  }

  // Get room statistics
  getRoomStats(): {
    totalRooms: number;
    activeRooms: number;
    inactiveRooms: number;
    averageMembers: number;
    oldestRoom?: Date;
    newestRoom?: Date;
  } {
    const allRooms = Array.from(this.rooms.values());
    const activeRooms = allRooms.filter(room => room.isActive);
    const inactiveRooms = allRooms.filter(room => !room.isActive);

    const totalMembers = allRooms.reduce((sum, room) => sum + room.memberCount, 0);
    const averageMembers = allRooms.length > 0 ? totalMembers / allRooms.length : 0;

    const joinTimes = allRooms.map(room => room.joinedAt.getTime());
    const oldestRoom = joinTimes.length > 0 ? new Date(Math.min(...joinTimes)) : undefined;
    const newestRoom = joinTimes.length > 0 ? new Date(Math.max(...joinTimes)) : undefined;

    return {
      totalRooms: allRooms.length,
      activeRooms: activeRooms.length,
      inactiveRooms: inactiveRooms.length,
      averageMembers,
      oldestRoom,
      newestRoom,
    };
  }

  // Clean up inactive rooms (garbage collection)
  cleanupInactiveRooms(maxAge: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    const roomsToRemove: string[] = [];

    this.rooms.forEach((room, roomId) => {
      if (!room.isActive) {
        const age = now - room.lastActivity.getTime();
        if (age > maxAge) {
          roomsToRemove.push(roomId);
        }
      }
    });

    roomsToRemove.forEach(roomId => {
      this.rooms.delete(roomId);
      console.log(`[RoomManager] Cleaned up inactive room: ${roomId}`);
    });

    if (roomsToRemove.length > 0) {
      console.log(`[RoomManager] Cleaned up ${roomsToRemove.length} inactive rooms`);
    }

    return roomsToRemove.length;
  }

  // Broadcast to room (if supported by the connection)
  broadcastToRoom(roomId: string, event: string, data: any): boolean {
    if (!this.isInRoom(roomId)) {
      console.warn(`[RoomManager] Cannot broadcast to room ${roomId}: not joined`);
      return false;
    }

    console.log(`[RoomManager] Broadcasting to room ${roomId}: ${event}`);
    this.emitRoomEvent('broadcast', roomId, { event, data });
    return true;
  }

  // Handle room events from server
  handleRoomEvent(event: string, roomId: string, data?: any): void {
    console.log(`[RoomManager] Handling room event: ${event} for room ${roomId}`, data);

    switch (event) {
      case 'member_joined':
        this.handleMemberJoined(roomId, data);
        break;
      case 'member_left':
        this.handleMemberLeft(roomId, data);
        break;
      case 'room_closed':
        this.handleRoomClosed(roomId, data);
        break;
      default:
        console.log(`[RoomManager] Unknown room event: ${event}`);
    }
  }

  private handleMemberJoined(roomId: string, data?: any): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.memberCount++;
      console.log(`[RoomManager] Member joined room ${roomId}, new count: ${room.memberCount}`);
    }
    this.emitRoomEvent('member_joined', roomId, data);
  }

  private handleMemberLeft(roomId: string, data?: any): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.memberCount = Math.max(0, room.memberCount - 1);
      console.log(`[RoomManager] Member left room ${roomId}, new count: ${room.memberCount}`);
    }
    this.emitRoomEvent('member_left', roomId, data);
  }

  private handleRoomClosed(roomId: string, data?: any): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.isActive = false;
      room.lastActivity = new Date();
      console.log(`[RoomManager] Room closed: ${roomId}`);
    }
    this.emitRoomEvent('room_closed', roomId, data);
  }

  private emitRoomEvent(event: string, roomId: string, data?: any): void {
    if (this.roomEmitter) {
      try {
        this.roomEmitter(event, roomId, data);
      } catch (error) {
        console.error(`[RoomManager] Error emitting room event ${event}:`, error);
      }
    }
  }

  // Utility methods for specific room types (from original service)
  joinRideRoom(rideId: number): boolean {
    return this.joinRoom(`ride_${rideId}`);
  }

  leaveRideRoom(rideId: number): boolean {
    return this.leaveRoom(`ride_${rideId}`);
  }

  isInRideRoom(rideId: number): boolean {
    return this.isInRoom(`ride_${rideId}`);
  }

  // Batch operations
  joinMultipleRooms(roomIds: string[]): number {
    let joinedCount = 0;
    for (const roomId of roomIds) {
      if (this.joinRoom(roomId)) {
        joinedCount++;
      }
    }
    console.log(`[RoomManager] Joined ${joinedCount}/${roomIds.length} rooms`);
    return joinedCount;
  }

  leaveMultipleRooms(roomIds: string[]): number {
    let leftCount = 0;
    for (const roomId of roomIds) {
      if (this.leaveRoom(roomId)) {
        leftCount++;
      }
    }
    console.log(`[RoomManager] Left ${leftCount}/${roomIds.length} rooms`);
    return leftCount;
  }
}

