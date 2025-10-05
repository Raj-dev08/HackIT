import express from 'express';
import { sendMsg, getMessages, deleteMessage, editMessage, getUnreadMessagesCount } from '../controller/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/send/messages/:id',protectRoute, sendMsg);
router.get('/get/messages/:id', protectRoute, getMessages);
router.get('/get/messages/unread-count/:id', protectRoute, getUnreadMessagesCount);

router.delete('/delete/messages/:id', protectRoute, deleteMessage);
router.put('/edit/messages/:id', protectRoute, editMessage);

export default router;