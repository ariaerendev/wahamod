export interface EngineBootstrap {
  bootstrap(): Promise<void>;

  shutdown(): Promise<void>;
}

export class NoopEngineBootstrap implements EngineBootstrap {
  async bootstrap(): Promise<void> {
    return;
  }

  async shutdown(): Promise<void> {
    return;
  }
}
