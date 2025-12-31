// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const yargs = require('yargs/yargs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { hideBin } = require('yargs/helpers');

// Parse CLI arguments
const argv = yargs(hideBin(process.argv))
  .option('number', {
    alias: 'n',
    type: 'number',
    description: 'Number of messages to send',
    default: 10,
  })
  .option('chat-id', {
    alias: 'to',
    type: 'number',
    description: 'Chat ID to send messages to',
    demandOption: true,
  })
  .option('session', {
    type: 'string',
    description: 'Session ID to use',
    demandOption: true,
  })
  .option('api-key', {
    alias: 'k',
    type: 'string',
    description: 'API key for authentication',
    demandOption: true,
  })
  .help().argv;

const sendTextMessage = async (session, numMessages, chatId, apiKey) => {
  const url = 'http://localhost:3000/api/sendText/';
  for (let i = 1; i <= numMessages; i++) {
    console.log(`Sending message ${i}`);
    const response = await axios.post(
      url,
      {
        chatId: chatId.toString(),
        session: session,
        text: `Message - ${i}`,
      },
      {
        headers: {
          Accept: 'application/json',
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log(`Message ${i} sent successfully:`, response.data);
  }
};

// Run the script
sendTextMessage(argv.session, argv.number, argv['chat-id'], argv['api-key']);
