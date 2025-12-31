import axios from 'axios';

export class ChatWootInboxNewAPI {
  constructor(
    private base: string,
    private inboxIdentifier: string,
  ) {}

  async updateLastSeen(sourceId: string, conversationId: number) {
    // TODO: Move to the lib (fork?)
    // Call the update_last_seen endpoint using a direct HTTP request
    // since the SDK doesn't have this method
    const path = `/public/api/v1/inboxes/${this.inboxIdentifier}/contacts/${sourceId}/conversations/${conversationId}/update_last_seen`;
    const url = new URL(path, this.base).toString();
    await axios.post(
      url,
      {},
      {
        headers: {
          api_access_token: this.inboxIdentifier,
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
