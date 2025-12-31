import { Agent } from 'https';
import type { Dispatcher } from 'undici';

export interface Agents {
  socket: Agent;
  fetch: Dispatcher;
}
