import User from "../model/user.model.js";
import FriendRequest from "../model/friendRequest.model.js";
import { redis } from "../lib/redis.js";
import { sendFriendEvent } from "../kafka/producer.js";

export const getAllFriends = async (req, res,next) => {
    try {
        const {user}=req;

        if(!user) {
            return res.status(401).json({message: "Unauthorized - no user found"});
        }

        const cachedFriends = JSON.parse(await redis.get(`friends:${user._id}`));


        if (cachedFriends) {
            return res.status(200).json({friends: JSON.parse(cachedFriends)});
        }

        const userAcc= await User.findById(user._id).populate("friends", "name profilePic email description friends");

        if(userAcc.friends.length === 0) {
            return res.status(404).json({message: "No friends found"});
        }

        await redis.set(`friends:${user._id}`, JSON.stringify(userAcc.friends),"EX",60*60); // Cache for 1 hour

        return res.status(200).json({friends:userAcc.friends,unreadCounts:userUnseenMap});
    } catch (error) {
        next(error);
    }
}

export const searchProfile = async (req, res, next) => {
  try {
    const { user } = req;
    const search = req.query.search;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - no user found" });
    }

    let searchConditions = {};
    let sort={}

    if (search) {
      if (search.length > 6) {
        // Use text search for longer queries
        searchConditions = { $text: { $search: search } };
        sort={ score: { $meta: "textScore" } }
        
      } else {
        // For short queries, use regex for partial matches
        
        searchConditions = {
          $or: [
            {name:{$regex: search||"",$options:"i"}},
            {email:{$regex: search||"",$options:"i"}},
            {description:{$regex: search||"",$options:"i"}},
          ],
        };
      }
    }

    let profile = await User.find({
      ...searchConditions,
      _id: { $ne: user._id }, // Exclude self
    })
      .sort(sort) // Sort by relevance if text search used
      .lean();



    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};


export const getAllFriendRequestsToMe = async (req, res,next) => {
    try {
        const {user} = req;

        if(!user) {
            return res.status(401).json({message: "Unauthorized - no user found"});
        }

        const cachedRequests = await redis.get(`friendRequestsToMe:${user._id}`);
        if (cachedRequests) {
            return res.status(200).json({friendRequests: JSON.parse(cachedRequests)});
        }

        const friendRequests = await FriendRequest.find({receiver: user._id, status: "pending"})
            .populate("sender", "name profilePic email").lean();

        if(friendRequests.length === 0) {
            return res.status(404).json({message: "No friend requests found"});
        }

        await redis.set(`friendRequestsToMe:${user._id}`, JSON.stringify(friendRequests),"EX",60*60); // Cache for 1 hour

        return res.status(200).json({friendRequests});
    } catch (error) {
        next(error);
    }
}

export const getAllFriendRequestsFromMe = async (req, res,next) => {
    try {
        const {user} = req;

        if(!user) {
            return res.status(401).json({message: "Unauthorized - no user found"});
        }

        const cachedRequests = await redis.get(`friendRequestsFromMe:${user._id}`);
        if (cachedRequests) {
            return res.status(200).json({friendRequests: JSON.parse(cachedRequests)});
        }

        const friendRequests = await FriendRequest.find({sender: user._id, status: "pending"})
            .populate("receiver", "name profilePic email").lean();

        if(friendRequests.length === 0) {
            return res.status(404).json({message: "No friend requests found"});
        }

        await redis.set(`friendRequestsFromMe:${user._id}`, JSON.stringify(friendRequests),"EX",60*60); // Cache for 1 hour

        return res.status(200).json({friendRequests});
    } catch (error) {
        next(error);
    }
}

export const sendFriendRequest = async (req, res,next) => {
    try {
        const {user} = req;
        const receiverId = req.params.id;

        if(!user) {
            return res.status(401).json({message: "Unauthorized - no user found"});
        }

        if(!receiverId) {
            return res.status(400).json({message: "Receiver ID is required"});
        }

        if(receiverId === user._id.toString()) {
            return res.status(400).json({message: "You cannot send a friend request to yourself"});
        }

        

        const receiver = await User.findById(receiverId);

        if(!receiver) {
            return res.status(404).json({message: "Receiver not found"});
        }

        if(user.friends.includes(receiverId)) {
            return res.status(400).json({message: "You are already friends with this user"});
        }

        if(receiver.friends.includes(user._id)) {
            return res.status(400).json({message: "You are already friends with this user"});
        }



        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: user._id, receiver: receiverId },
                { sender: receiverId, receiver: user._id }
            ]
        });


        if(existingRequest) {
            return res.status(400).json({message: "friend request already exists"});
        }
        

        const newRequest = await FriendRequest.create({
            sender: user._id,
            receiver: receiverId
        });

        await sendFriendEvent({
            type:"friend-request-sent",
            receiverId:receiverId,
            sender: user
        })
        

        await redis.del(`friendRequestsToMe:${receiverId}`); // Invalidate cache for receiver
        await redis.del(`friendRequestsFromMe:${user._id}`); // Invalidate cache for sender

        return res.status(201).json({message: "Friend request sent successfully", request: newRequest});
    } catch (error) {
        next(error);
    }
}

export const acceptFriendRequest = async (req, res,next) => {
    try {
        const {user} = req;
        const friendRequestId = req.params.id;

        if(!user) {
            return res.status(401).json({message: "Unauthorized - no user found"});
        }

        if(!friendRequestId) {
            return res.status(400).json({message: "Friend request ID is required"});
        }

        const friendRequest = await FriendRequest.findById(friendRequestId);

        if(!friendRequest) {
            return res.status(404).json({message: "Friend request not found"});
        }

        if(friendRequest.receiver.toString() !== user._id.toString()) {
            return res.status(403).json({message: "You can only accept requests sent to you"});
        }

        if(friendRequest.status !== "pending") {
            return res.status(400).json({message: "Friend request is not pending"});
        }

        friendRequest.status = "accepted";
        
        const sender= await User.findById(friendRequest.sender);

        if(!user.friends.includes(sender._id)) {
            user.friends.push(sender._id);
        }

        if(!sender.friends.includes(user._id)) {
            sender.friends.push(user._id);
        }

        await sendFriendEvent({
            type:"friend-request-accepted",
            acceptedBy:user,
            receiverId: friendRequest.receiver
        })

        await friendRequest.save();
        await user.save();
        await sender.save();

        await redis.del(`friends:${user._id}`); // Invalidate cache for user
        await redis.del(`friends:${sender._id}`); // Invalidate cache for sender

        await redis.del(`friendRequestsToMe:${user._id}`); // Invalidate cache for receiver
        await redis.del(`friendRequestsFromMe:${sender._id}`); // Invalidate cache for sender

        return res.status(200).json({message: "Friend request accepted"});
    } catch (error) {
        next(error);
    }
}


export const rejectFriendRequest = async (req, res,next) => {
    try {
        const {user} = req;
        const friendRequestId = req.params.id;

        if(!user) {
            return res.status(401).json({message: "Unauthorized - no user found"});
        }

        if(!friendRequestId) {
            return res.status(400).json({message: "Friend request ID is required"});
        }

        const friendRequest = await FriendRequest.findById(friendRequestId);

        if(!friendRequest) {
            return res.status(404).json({message: "Friend request not found"});
        }

        if(friendRequest.receiver.toString() !== user._id.toString()) {
            return res.status(403).json({message: "You can only reject requests sent to you"});
        }

        if(friendRequest.status !== "pending") {
            return res.status(400).json({message: "Friend request is not pending"});
        }

        friendRequest.status = "rejected";

        const senderId=friendRequest.sender;
        
        await friendRequest.save();


        await redis.del(`friends:${user._id}`); // Invalidate cache for user
        await redis.del(`friends:${senderId}`); // Invalidate cache for sender

        await redis.del(`friendRequestsToMe:${user._id}`); // Invalidate cache for receiver
        await redis.del(`friendRequestsFromMe:${senderId}`); // Invalidate cache for sender

        return res.status(200).json({message: "Friend request Rejected"});
    } catch (error) {
        next(error);
    }
}

export const viewFriendProfile = async (req, res,next) => {
    try {
        const {user} = req;
        const friendId = req.params.id;

        if(!user) {
            return res.status(401).json({message: "Unauthorized - no user found"});
        }

        if(!friendId) {
            return res.status(400).json({message: "Friend ID is required"});
        }

        if(friendId === user._id.toString()) {
            return res.status(400).json({message: "You cannot view your own profile"});
        }

        const friend = await User.findById(friendId).select("-password").lean();

        if(!friend) {
            return res.status(404).json({message: "Friend not found"});
        }

        return res.status(200).json({friend});
    } catch (error) {
        next(error);
    }
}