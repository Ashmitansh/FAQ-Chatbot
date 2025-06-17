require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 5000;

// Initialize the GenAI client with your API key from environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("Error: GEMINI_API_KEY is not set in the .env file.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});

// Middleware
app.use(cors()); // Allows frontend to make requests to this backend
app.use(express.json()); // Parses incoming JSON requests

// Define the chat endpoint
app.post('/ask', async (req, res) => {
  const userQuestion = req.body.question;
  console.log(`User asks: "${userQuestion}"`);

  // Construct the prompt for Taurus, including its persona and instructions
  const fullPrompt = `You are Taurus and you are an AI Chatbot but don't use taurus here when someone ask you a question. Asking for the first question to begin. Try to be polite with the users and give answers in a concise manner. You have to answer the user every question possible.Then ask for the next question. No need to greet, say Taurus and introduce yourself in every answer you give. Here is the user's question: "${userQuestion}"`;

  try {
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    console.log(`Taurus replies: "${responseText}"`);
    res.json({ answer: responseText });

  } catch (error) {
    console.error('Error generating content from Gemini API:', error);
    res.status(500).json({ answer: 'I apologize, but I am unable to answer your question at the moment. Please try again later.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Taurus backend server running at http://localhost:${port}`);
});