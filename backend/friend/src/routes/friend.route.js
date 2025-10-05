import express from 'express';
import {
    getAllFriends,
    getAllFriendRequestsToMe,
    getAllFriendRequestsFromMe,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    viewFriendProfile,
    searchProfile
} from '../controller/friend.controller.js';

import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/friends', protectRoute, getAllFriends);
router.get('/search',protectRoute,searchProfile);
router.get('/friend-requests/to-me', protectRoute, getAllFriendRequestsToMe);
router.get('/friend-requests/from-me', protectRoute, getAllFriendRequestsFromMe);
router.post('/send-request/:id', protectRoute, sendFriendRequest);
router.post('/accept-request/:id', protectRoute, acceptFriendRequest);
router.post('/reject-request/:id', protectRoute, rejectFriendRequest);
router.get('/view-profile/:id', protectRoute, viewFriendProfile);

export default router;