import { handleUserMessage, saveKnowledgeBase } from './chat.service.js';
import { socketService } from '../../services/socket.service.js';

export async function handleChatMessage(req, res) {
    const { message, room } = req.body;
    if (!message) return res.status(400).send('Message is required');
    try {
        const responseMessage = await handleUserMessage(message);
        socketService.broadcastToRoom('chat-add-msg', { from: 'Bot', txt: responseMessage, room }, room);
        res.send({ message: responseMessage });
    } catch (error) {
        res.status(500).send({ error: 'Failed to process the message' });
    }
}


export async function handleLearnMessage(req, res) {
    const { question, answer, room } = req.body;
    console.log("Received learning request:", question, answer);
    if (!question || !answer) return res.status(400).send('Question and answer are required');
    try {
        await saveKnowledgeBase(question, answer);
        console.log("Learning response saved:", question, answer);

        // Broadcast the learning response to the room
        socketService.broadcast({ type: 'chat-add-msg', data: { from: 'Bot', txt: `Learned new response for "${question}"`, room }, room });
        res.send({ message: `Learned new response for "${question}"` });
    } catch (error) {
        console.error('Failed to save the response', error);
        res.status(500).send({ error: 'Failed to save the response' });
    }
}
