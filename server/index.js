require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// --- Transmission RPC ---

const transmissionRpcUrl = process.env.TRANSMISSION_RPC_URL;
const transmissionUsername = process.env.TRANSMISSION_USERNAME;
const transmissionPassword = process.env.TRANSMISSION_PASSWORD;

// Use a variable to store the session ID. It will be fetched on the first request.
let transmissionSessionId = null;

const transmissionApi = axios.create({
  baseURL: transmissionRpcUrl,
  auth: {
    username: transmissionUsername,
    password: transmissionPassword,
  },
});

// Interceptor to handle the session ID
transmissionApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 409) {
      const sessionId = error.response.headers['x-transmission-session-id'];
      if (sessionId) {
        console.log('Got new Transmission session ID.');
        transmissionSessionId = sessionId;
        // Set the header for the original request and retry it
        error.config.headers['X-Transmission-Session-Id'] = sessionId;
        return transmissionApi.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

app.get('/', (req, res) => {
  res.send('Hello from the Gearshift server!');
});

app.post('/api/rpc', async (req, res) => {
  try {
    const { method, arguments: args } = req.body;

    if (!method) {
      return res.status(400).json({ error: 'Missing "method" in request body' });
    }

    const response = await transmissionApi.post(
      transmissionRpcUrl,
      {
        method,
        arguments: args,
      },
      {
        headers: {
          'X-Transmission-Session-Id': transmissionSessionId,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Error communicating with Transmission server',
        details: error.response.data,
      });
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        details: error.message,
      });
    }
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
