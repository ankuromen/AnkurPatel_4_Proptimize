const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();
const port = 8000;
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  const data = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      ...messages,
    ],
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Error from OpenAI API:', response.statusText);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const responseData = await response.json();

    if (responseData.choices && responseData.choices.length > 0) {
      const content = responseData.choices[0].message.content.trim();
      res.send(content);
    } else {
      console.error('Invalid response from OpenAI:', responseData);
      res.status(500).json({ error: 'Invalid response from OpenAI' });
    }
  } catch (error) {
    console.error('Error in processing chat request:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/title', async (req, res) => {
  try {
    const { title } = req.body;
    console.log(title);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a creative assistant that generates titles.',
          },
          {
            role: 'user',
            content: `Write a 3 words title for the following prompt: ${title}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
        n: 1,
      }),
    });

    const data = await response.json();
    console.log(data, 'data');
    res.status(200).json({ title: data?.choices?.[0]?.message?.content });
  } catch (error) {
    console.error(error, 'error');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server Running At Port: ${port}`);
});
