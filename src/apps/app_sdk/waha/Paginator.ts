import * as lodash from 'lodash';

type Call<Record> = (processed: number) => Promise<Record[]>;

export interface PaginatorParams {
  processed?: number;
  max?: number;
}

const DefaultParams: PaginatorParams = {
  processed: 0,
  max: Infinity,
};

/**
 * Generic paginator for APIs that return arrays of records with limits and offsets.
 */
export class ArrayPaginator<Record> {
  private readonly params: PaginatorParams;

  constructor(params: PaginatorParams = DefaultParams) {
    this.params = lodash.merge({}, DefaultParams, params) as PaginatorParams;
  }

  async *iterate(call: Call<Record>): AsyncGenerator<Record> {
    let processed = this.params.processed;
    let records: Record[] = [];

    while (true) {
      records = await call(processed);
      if (records.length === 0) {
        return;
      }
      for (const record of records) {
        yield record;
        processed += 1;
        if (processed >= this.params.max) {
          return;
        }
      }
    }
  }
}
