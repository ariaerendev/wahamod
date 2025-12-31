import { BehaviorSubject, EMPTY, Observable, share, switchMap } from 'rxjs';

const noop = (x: any) => x;

/**
 * Observable that can easily be switched to new observable
 * So you can change "source" of the observable,
 * but clients will use the same observable (but consume NEW data from NEW source)
 */
export class SwitchObservable<T> extends Observable<T> {
  private subject$: BehaviorSubject<Observable<T>>;

  /**
   * fn - Modify inner observable
   *
   */
  constructor(fn: (source: Observable<T>) => Observable<T> = noop) {
    const subject$ = new BehaviorSubject<Observable<any>>(EMPTY);
    let observable$ = subject$.pipe(switchMap((stream$) => stream$));
    observable$ = fn(observable$);

    super((subscriber) => observable$.subscribe(subscriber));
    this.subject$ = subject$;
  }

  switch(newObservable$: Observable<T>) {
    // If newObservable$ is null or undefined, use EMPTY instead
    this.subject$.next(newObservable$ || EMPTY);
  }

  complete() {
    this.switch(EMPTY);
    this.subject$.complete();
  }
}
