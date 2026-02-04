// lib/event-bus.ts
import { EventEmitter } from 'events';

// Prevent multiple instances in development due to hot-reloading
const globalForEvents = global as unknown as { eventBus: EventEmitter };

export const eventBus = globalForEvents.eventBus || new EventEmitter();

if (process.env.NODE_ENV !== 'production') globalForEvents.eventBus = eventBus;
