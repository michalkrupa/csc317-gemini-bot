import express from 'express';
import dotenv from 'dotenv';
import { gemini_api_call } from './scripts/gemini_api_call.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

dotenv.config();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/gemini', async (req, res) => {
    try {
        const { userQuery } = req.body;

        if (!userQuery) {
            return res.status(400).send('No query provided');
        }

        // Call your Gemini API function
        const response = await gemini_api_call(userQuery);

        // Send the response back to the client
        // res.send(response);
        res.json(response);

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).send({'message': 'Error processing your request', 'details': error});
    }
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});