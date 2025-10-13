import Hackathons from "../model/hackathon.model.js"
import cloudinary from "../lib/cloudinary.js"
import { redis } from "../lib/redis.js"

export const createHackathon = async (req,res,next) => {
    try {
        const { user } = req;

        const { name, description, lat, lng, websiteUrl,prize,image,date}=req.body;

        const extra = {}

        if (!name || !description || !lat || !lng || !date){
            return res.status(400).json({message:"All fields are required"})
        }

        const eventDate = new Date(date);

        if (isNaN(eventDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format!" });
        }

        if (eventDate < new Date()) {
            return res.status(400).json({ message: "Date cannot be in the past!" });
        }

        if ( websiteUrl ){
            extra.websiteUrl=websiteUrl
        }
        if ( prize ){
            extra.prize=prize
        }
        if ( image ){
            const uploadedResponse= await cloudinary.uploader.upload(image);
            extra.image=uploadedResponse.secure_url
        }

        const newHackathon = new Hackathons({
            name,
            description,
            lat,
            lng,
            date:eventDate,
            ...extra,
            Host:user._id
        })

        user.hackathons.push(newHackathon._id);

        await newHackathon.save();
        await user.save();
        await redis.del(`userHackathons:${user._id}`)

        return res.status(201).json({message:"project created successfully" ,newHackathon});

    } catch (error) {
        next(error)
    }
}

export const getUserHackathons = async (req,res,next) => {
    try {
        const {user}=req

        // const cachedHackathons = await redis.get(`userHackathons:${user._id}`)

        // if (cachedHackathons){
        //    return res.status(200).json({hackathons:JSON.parse(cachedHackathons)})
        // }
        
        const hackathons = await Hackathons.find({ Host: user._id })
            .populate("Host", "name profilePic")
            .lean(); // Use lean() for better performance if you don't need Mongoose documents
 
        // await redis.set(`userHackathons:${user._id}`,JSON.stringify(hackathons),"EX",60*60)
        // id we cache there is potential fake data there for a hour 
        //we can cache per document but thats just too much
        return res.status(200).json({hackathons})
    } catch (error) {
        next(error)
    }
}

export const getHackathons = async (req,res,next) => {
    try {
        const search = req.query.search || "";
        const limit = parseInt(req.query.limit)||50
        const skip = parseInt(req.query.skip)||0
        const price = req.query.price !== undefined ? parseInt(req.query.price) : undefined;
        const date=req.query.date|| new Date()

        

        let searchConditions={
            date:{$gt:date}
        }
        
        if(search){
            searchConditions.$text = { $search: search } ;
        }

        if(price !== undefined){
            searchConditions.price = { $lt : price}
        }

        const hackathons = await Hackathons.find(searchConditions)
            .limit(limit)
            .skip(skip)
            .select("name description lat lng upvotes downvotes date image")
            .sort({createdAt:-1});

        const countHackathons = await Hackathons.countDocuments(searchConditions)

        const hasMore = countHackathons > skip + hackathons.length

        return res.status(200).json({hackathons,hasMore})
    } catch (error) {
        next(error)
    }
}

export const getHackathonDetail = async (req,res,next) => {
    try {
        const hackathonId=req.params.id;

        if ( !hackathonId){
            return res.status(400).json({message:"Hackathon Id is required"})
        }

        const cachedHackathon = await redis.get(`hackathon:${hackathonId}`)

        if (cachedHackathon){
            return res.status(200).json({hackathon:JSON.parse(cachedHackathon)})
        }

        const hackathon = await Hackathons.findById(hackathonId)
            .populate("Host","name profilePic")
            .lean()

        if (!hackathon){
            return res.status(404).json({message:"Hackathon not found"})
        }
 
        const expireTime = Math.floor( (hackathon.date - Date.now() )/1000)

        await redis.set(`hackathon:${hackathonId}`,JSON.stringify(hackathon),"EX",expireTime)

        return res.status(200).json({hackathon})
    } catch (error) {
        next(error)
    }
}

export const vote = async (req,res,next) => {
    try {
        const {method}  = req.query
        const hackathonId= req.params.id
        const {user}=req

        if ( method === undefined){
            return res.status(400).json({message:"must have a method"})
        }

        const hackathon= await Hackathons.findById(hackathonId)

        if(!hackathon){
            return res.status(404).json({message:"Hackathon not found"})
        }

        if (!["like", "dislike"].includes(method)) {
            return res.status(400).json({ message: "Invalid method" });
        }

        if (method === "like"){
            if(hackathon.upvotes.includes(user._id)){
                hackathon.upvotes.pull(user._id)
            }
            else{
                if(hackathon.downvotes.includes(user._id)){
                    hackathon.downvotes.pull(user._id)
                }
                hackathon.upvotes.push(user._id)
            }
        }
        else if (method === "dislike"){
            if(hackathon.downvotes.includes(user._id)){
               hackathon.downvotes.pull(user._id)
            }
            else{
                if(hackathon.upvotes.includes(user._id)){
                    hackathon.upvotes.pull(user._id)
                }
                hackathon.downvotes.push(user._id)
            }
            
        }
        
        await hackathon.save()

        await redis.del(`hackathon:${hackathonId}`)
        await redis.del(`userHackathons:${hackathon.Host}`)

        return res.status(200).json({hackathon})
    } catch (error) {
        next(error)
    }
}

export const giveReview = async (req,res,next) => {
    try {
        const {user}=req
        const { review , reviewId }=req.body
        const hackathonId=req.params.id

        if (!review){
            return res.status(400).json({message:"Must have review"})
        }

        if(!hackathonId){
            return res.status(400).json({message:"Must provide ID"})
        }

        const hackathon = await Hackathons.findById(hackathonId)
                            .populate("Host","name profilePic")

        if(!hackathon){
            return res.status(404).json({message:"hackathon doesnt exist"})
        }

        hackathon.reviews.push({
            review,
            reviewer: {
                _id: user._id,
                name: user.name,
                profilePic: user.profilePic
            },
            _id: reviewId
        })
        
        await hackathon.save()

        const expireTime = Math.floor( (hackathon.date - Date.now() )/1000)

        await redis.set(`hackathon:${hackathonId}`,JSON.stringify(hackathon),"EX",expireTime)

        return res.status(200).json({message:"Successfully gave review"})
    } catch (error) {
        next(error)
    }
}

export const deleteReview = async (req,res,next) => {
    try {
        const {user}=req
        const { reviewId , hackathonId }=req.params

        if (!reviewId || !hackathonId){
            return res.status(400).json({message:"Must provide all IDs"})
        }

        const hackathon = await Hackathons.findById(hackathonId)
                            .populate("Host","name profilePic")

        if(!hackathon){
            return res.status(404).json({message:"hackathon doesnt exist"})
        }

        const review = hackathon.reviews.id(reviewId)
      

        if (!review){
            return res.status(404).json({message:"Review doesnt exist"})
        }

        if ( review.reviewer._id.toString() !== user._id.toString() ){
            return res.status(403).json({message:"You can only delete your own reviews"})
        }
       
        hackathon.reviews.pull({ _id: reviewId })
        await hackathon.save()

        const expireTime = Math.floor( (hackathon.date - Date.now() )/1000)

        await redis.set(`hackathon:${hackathonId}`,JSON.stringify(hackathon),"EX",expireTime)

        return res.status(200).json({message:"Successfully deleted review"})
    } catch (error) {
        next(error)
    }
}

export const deleteHackathon = async (req,res,next) => {
    try {
        const {user}=req
        const hackathonId=req.params.id

        if(!hackathonId){
            return res.status(400).json({message:"No ID provided"})
        }

        let hackathon

        const cachedHackathon = await redis.get(`hackathon:${hackathonId}`)

        if(cachedHackathon){
            hackathon=JSON.parse(cachedHackathon)
        }
        else {
            hackathon = await Hackathons.findById(hackathonId)
        }
        const HostID= hackathon.Host._id ? hackathon.Host._id : hackathon.Host

        if ( HostID.toString() !== user._id.toString()){
            return res.status(403).json({message:"Only the host can delete the hackathon"})
        }

        user.hackathons.pull(hackathonId)
        await user.save()

        await Hackathons.findByIdAndDelete(hackathonId)

        await redis.del(`hackathon:${hackathonId}`)
        await redis.del(`userHackathons:${HostID}`)

        return res.status(200).json({message:"Successfully deleted"})
    } catch (error) {
        next(error)
    }
}