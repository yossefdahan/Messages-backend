import { Router } from 'express';
import { handleChatMessage, handleLearnMessage } from './chat.controller.js';

const router = Router();

router.post('/', handleChatMessage);
router.post('/learn', handleLearnMessage);

export const chatRoutes = router;
