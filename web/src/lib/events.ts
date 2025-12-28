/**
 * Event system for web version
 * Replaces Tauri event system
 */

export type UnlistenFn = () => void;

type EventCallback<T = unknown> = (event: { payload: T }) => void;

class EventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  listen<T>(event: string, callback: EventCallback<T>): Promise<UnlistenFn> {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    return Promise.resolve(() => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback as EventCallback);
      }
    });
  }

  emit<T>(event: string, payload: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback({ payload }));
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventEmitter = new EventEmitter();

export async function listen<T>(
  event: string,
  callback: EventCallback<T>
): Promise<UnlistenFn> {
  return eventEmitter.listen(event, callback);
}

export function emit<T>(event: string, payload: T): void {
  eventEmitter.emit(event, payload);
}
