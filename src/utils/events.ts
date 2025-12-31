/**
 * Unmask "*" in events list to exact values
 * Remove duplicates if any
 */
export class EventWildUnmask {
  constructor(
    private readonly events: string[] | any,
    private readonly all: string[] | any | null = null,
  ) {
    // in case of enum - convert to array
    this.events = Object.values(events);
    this.all = all ? Object.values(all) : this.events;
  }

  unmask(events: string[]) {
    const rightEvents = [];
    if (events.includes('*')) {
      rightEvents.push(...this.all);
    }

    // Get only known events, log and ignore others
    for (const event of events) {
      if (!this.events.includes(event)) {
        continue;
      }
      rightEvents.push(event);
    }
    // return unique values
    return [...new Set(rightEvents)];
  }
}
