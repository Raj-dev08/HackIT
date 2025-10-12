import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        websiteUrl:{
            type:String
        },
        image:{
            type:String
        },
        lat:{
            type:Number,
            required:true
        },
        lng:{
            type:Number,
            required:true
        },
        price:{
            type:String
        },
        description:{
            type:String,
            required:true
        },
        Host:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        upvotes:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
            }  
        ],
        downvotes:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",                
            }  
        ],
        date:{
            type:Date,
            required:true
        },
        reviews:[
            {
                review:{
                    type:String,
                    required:true
                },
                reviewer:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"User",
                    required:true
                }
            }
        ]
    },
    {timestamps:true}
);

hackathonSchema.index({createdAt:-1});

hackathonSchema.index({ date: 1 }, { expireAfterSeconds: 0 });

hackathonSchema.index({name:"text",description:"text"})

const Hackathons = mongoose.model("Hackathons",hackathonSchema)

export default Hackathons