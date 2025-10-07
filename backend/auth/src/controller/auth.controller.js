import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import {upsertStreamUser} from "../lib/stream.js"
import { generateStreamToken } from "../lib/stream.js";
import sodium from 'libsodium-wrappers';
import crypto from 'crypto'
await sodium.ready;


const signupNonces = new Map();

export const signupChallenge = async ( req, res, next ) => {
  try {
   
    const nonce = crypto.randomUUID();
    const nonceId = crypto.randomUUID();
    signupNonces.set(nonceId,nonce);

    
    setTimeout(()=> signupNonces.delete(nonceId), 5*60*1000);
    res.status(200).json({messaeg:"done",nonce,nonceId})
  } catch (error) {
    next(error)
  }
}

export const signup = async (req, res,next) => {
    const { name, email, password, publicKey, signature, nonceId} = req.body;
    // console.log(req.body)
    try {
        if(!name || !email  || !password || !publicKey|| !signature|| !nonceId){
            return res.status(400).json({message: "All fields are required"});
        }
    
        const nonce = signupNonces.get(nonceId)

        if(!nonce){
          return res.status(400).json({message:"Nonce expired or invalid" });
        }

        signupNonces.delete(nonceId)

        const pub = sodium.from_base64( publicKey, sodium.base64_variants.ORIGINAL);
        const sig = sodium.from_base64( signature, sodium.base64_variants.ORIGINAL);
        const ok = sodium.crypto_sign_verify_detached(sig,sodium.from_string(nonce),pub);//verify all the signautre,nonce using the publickey
        if(!ok){
          return res.status(400).json({message:"Invalid signature proof"});
        }

        if(password.length < 4){
            return res.status(400).json({message: "Password must be atleast 4 characters long"});
        }
    
        const user = await User.findOne({email});
    
        if(user){
            return res.status(400).json({message: "User with the email already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        const newUser = new User({
            name,
            email,  
            password: hashedPassword,
            publicToken:publicKey
        });

        if (newUser) {

          try {
            await upsertStreamUser({
              id: newUser._id.toString(),
              name: newUser.name,
              image: newUser.profilePic || "",
            });
            console.log(`Stream user created for ${newUser.name}`);
          } catch (error) {
            console.log("Error creating Stream user:", error);
          }

          // generate jwt token here
          generateToken(newUser._id, res);
          await newUser.save();
    
          res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            profilePic: newUser.profilePic,
          });

          } else {
            res.status(400).json({ message: "Invalid user data" });
          }
        } catch (error) {
          next(error);
        }
};


export const login = async (req, res,next) => {
    const {email,password} = req.body;

    try {
        
        const user= await User.findOne({email});

        if(!user){
            return res.status(400).json({message: "User with the email does not exist"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"});
        }


        generateToken(user._id, res);
        
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            description: user.description,
            profilePic: user.profilePic,
        });
    } catch (error) {
        next(error);
    }

}


export const logout = async (req, res,next) => {
    try {
        res.cookie("jwt", "",{maxAge:0});
        res.status(200).json({message: "User logged out successfully"});    
    } catch (error) {
        next(error);
    }
}

export const updateProfile = async (req, res,next) => {
    try {
      const { profilePic, description , name} = req.body;
      const userId = req.user._id;
  
      if (!profilePic && !description && !name) {
        return res.status(400).json({ message: "Please any info to change" });
      }
  
      const updateData = {};
  
      // Handle profile picture upload
      if (profilePic) {
        const uploadedResponse = await cloudinary.uploader.upload(profilePic);
        updateData.profilePic = uploadedResponse.secure_url;
      }
  
      // Handle description update
      if (description) {
        updateData.description = description;
      }

      if (name) {
        updateData.name = name;
      }
  
      // Update user in the database
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      try {
        await upsertStreamUser({
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          image: updatedUser.profilePic || "",
        });
        console.log(`Stream user updated after onboarding for ${updatedUser.name}`);
      } catch (streamError) {
        console.log("Error updating Stream user during onboarding:", streamError.message);
      }

      res.status(200).json(updatedUser);
    } catch (error) {
       next(error);
    }
  };

export const checkAuth = (req, res,next) => {
    try {
      if(!req.user){
        res.status(401).json({message : "unauthorized access Please login!"});
      }  
      res.status(200).json(req.user);
    } catch (error) {
      next(error);
    }
  };
  

export const beAdmin = async(req,res,next)=>{
    try {
        const { user } = req;

        const {password} = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        if (!user) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        if (user.isAdmin) {
            return res.status(400).json({ message: "User is already an admin" });
        }

        if (password !== process.env.ADMIN_PASSWORD) {
            return res.status(403).json({ message: "Invalid password" });
        }

        user.isAdmin=true;
        await user.save();

        return res.status(200).json({ message: "User promoted to admin" });
    } catch (error) {
       next(error);
    }
}

export const cancelAdmin = async(req,res,next)=>{
    try {
        const { user } = req;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        if (!user.isAdmin) {
            return res.status(400).json({ message: "User is not an admin" });
        }

        user.isAdmin=false;
        await user.save();

        return res.status(200).json({ message: "User demoted to regular user" });
    } catch (error) {
        next(error);
    }
}

export const getStreamToken =  (req,res,next) => {
  try {
    const token = generateStreamToken(req.user.id)

    res.status(200).json({token})
  } catch (error) {
    next(error)
  }
}