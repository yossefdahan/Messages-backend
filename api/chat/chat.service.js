import { dbService } from '../../services/db.service.js';
import { logger } from '../../services/logger.service.js';

let knowledgeBase = {};

export async function handleUserMessage(message) {
    const userMessage = message.toLowerCase();
    console.log(userMessage);
    // Learning mechanism
    if (userMessage.startsWith('learn:')) {
        const [key, value] = userMessage.substring(6).split('::');
        if (key && value) {
            knowledgeBase[key.trim()] = value.trim();
            await saveKnowledgeBase(key.trim(), value.trim());
            return `Learned new response for "${key.trim()}"`;
        } else {
            return 'Invalid learning format. Use learn:<question>::<response>';
        }
    }

    // Check if the message exists in the knowledge base
    if (knowledgeBase[userMessage]) {
        console.log("knowledgeBase[userMessage]", knowledgeBase[userMessage]);
        return knowledgeBase[userMessage];
    }

    return 'I am here to help you!';
}

export async function loadKnowledgeBase() {
    try {
        const collection = await dbService.getCollection('knowledgeBase');
        const knowledge = await collection.find({}).toArray();
        knowledge.forEach(item => {
            knowledgeBase[item.question] = item.answer;
        });
        logger.info('Knowledge base loaded successfully');
    } catch (err) {
        logger.error('Failed to load knowledge base', err);
        throw err;
    }
}

export async function saveKnowledgeBase(question, answer) {
    try {
        const collection = await dbService.getCollection('knowledgeBase');
        await collection.updateOne(
            { question },
            { $set: { answer } },
            { upsert: true }
        );
        knowledgeBase[question] = answer; // Update the local knowledgeBase object
        logger.info('Knowledge base updated successfully');
    } catch (err) {
        logger.error('Failed to save knowledge base', err);
        throw err;
    }
}

