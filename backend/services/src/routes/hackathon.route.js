import express from 'express'
import { createHackathon,
        getHackathonDetail,
        getUserHackathons,
        getHackathons,
        vote,
        giveReview,
        deleteHackathon
    } from "../controller/hackathon.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router=express.Router()

router.get("/",getHackathons)
router.get("/user-hackathons",protectRoute,getUserHackathons)



router.post("/create",protectRoute,createHackathon)
router.post("/vote/:id",protectRoute,vote)
router.post("/give-review/:id",protectRoute,giveReview)

router.get("/:id",getHackathonDetail)

router.delete("/:id",protectRoute,deleteHackathon)

export default router