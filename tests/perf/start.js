// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const yargs = require('yargs/yargs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { hideBin } = require('yargs/helpers');

// Parse CLI arguments
const argv = yargs(hideBin(process.argv))
  .option('sessions', {
    alias: 'n',
    type: 'number',
    description: 'Number of sessions to create',
    default: 10,
  })
  .option('api-key', {
    alias: 'k',
    type: 'string',
    description: 'API key for authentication',
    demandOption: true,
  })
  .help().argv;

const createSessions = async (numSessions, apiKey) => {
  const url = 'http://localhost:3000/api/sessions/';

  for (let i = 1; i <= numSessions; i++) {
    try {
      console.log(`Creating session ${i}`);
      const response = await axios.post(
        url,
        {
          name: '',
          config: {
            metadata: {},
            webhooks: [],
          },
          start: true,
        },
        {
          headers: {
            Accept: 'application/json',
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(`Session ${i} created successfully:`, response.data);
    } catch (error) {
      console.error(`Error creating session ${i}:`, error.message);
    }
  }
};

// Run the script
createSessions(argv.sessions, argv['api-key']);
