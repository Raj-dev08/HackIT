import express from 'express';
import { 
        login,
        logout,
        signup ,
        updateProfile,
        checkAuth,
        beAdmin,
        cancelAdmin,
        getStreamToken
    } from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

router.post("/be-admin", protectRoute, beAdmin);
router.post("/cancel-admin", protectRoute, cancelAdmin);

router.get("/get-stream-token",protectRoute,getStreamToken)

export default router;