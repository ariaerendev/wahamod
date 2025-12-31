import { filter, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

interface EventValue<T> {
  event: string;
  data: T;
}

export function onlyEvent<T>(event: any) {
  return pipe(
    filter<EventValue<T>>((obj) => obj.event === event),
    map((event) => event.data),
  );
}
