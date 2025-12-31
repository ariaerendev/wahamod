import axios from 'axios';
import { Agent as HttpsAgent } from 'https';

const InsecureHttpsAgent = new HttpsAgent({
  rejectUnauthorized: false,
});

export async function fetchBuffer(url: string): Promise<Buffer> {
  return axios
    .get(url, {
      responseType: 'arraybuffer',
      httpsAgent: InsecureHttpsAgent,
    })
    .then((res) => {
      return Buffer.from(res.data);
    });
}
