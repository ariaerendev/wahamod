import { EventEmitter } from 'events';
import { Observable, Subscription } from 'rxjs';

interface EventValue<T> {
  event: string;
  data: T;
}

export class EventsFromObservable<Events extends string> extends EventEmitter {
  private subscription: Subscription;

  constructor(private observable: Observable<EventValue<any>>) {
    super();
  }

  on(event: Events, listener: (...args: any[]) => void): this {
    return super.on(event as string, listener);
  }

  start() {
    this.subscription = this.observable.subscribe({
      next: (data) => this.emit(data.event, data.data),
      complete: () => this.removeAllListeners(),
      error: (err) => null,
    });
  }

  stop() {
    this.subscription.unsubscribe();
  }
}
