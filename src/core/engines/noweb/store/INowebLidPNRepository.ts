import { LimitOffsetParams } from '@waha/structures/pagination.dto';

export class LidToPN {
  id: string;
  pn: string;
}

export interface INowebLidPNRepository {
  /**
   * Save lid to phone number mapping
   */
  saveLids(lids: LidToPN[]): Promise<void>;

  /**
   * Get all lids with pagination
   */
  getAllLids(pagination?: LimitOffsetParams): Promise<LidToPN[]>;

  /**
   * Get a total count of lids
   */
  getLidsCount(): Promise<number>;

  /**
   * Find a phone number by lid
   */
  findPNByLid(lid: string): Promise<string | null>;

  /**
   * Find lid by phone number
   */
  findLidByPN(pn: string): Promise<string | null>;
}
