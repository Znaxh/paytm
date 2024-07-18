const express = require("express")
const { User } = require("../db")
const { Account } = require("../db")
const { JWT_SECRET } = require("../config")
const { authMiddleware } = require("../middleware")
const jwt = require("jsonwebtoken")
const zod = require("zod");
const { route } = require("./user")
const router = express.Router();

const signupBody = zod.object({
    username : zod.string().email(),
    firstname : zod.string(),
    lastname : zod.string(),
    password : zod.string()
})

router.post("/signup",async (req,res)=>{
    const { success } = signupBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username : req.body.username
    })

    if(existingUser){
        res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const user = await User.create({
        username : req.body.username,
        password : req.body.password,
        firstname : req.body.firstname,
        lastname : req.body.lastname
    })
    
    const userId = user._id;

    await Account.create({
        userId,
        balance : 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    },JWT_SECRET);

    res.status(200).json({
        message: "User created successfully",
	    token: token
    })
})


const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin",async (req,res)=>{
    const { success } = signinBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: "Error while logging in"
        })
    }

    const user = await User.findOne({
        username : req.body.username,
        password : req.body.password
    });

    if(!user){
        res.status(411).json({
            message: "Error while logging in"
        })
    }

    const userId = user._id;

    const token = jwt.sign({
        userId
    },JWT_SECRET);

    res.status(200).json({
        token: token
    })
})

const updateBody = zod.object({
    password : zod.string().optional(),
    firstname : zod.string().optional(),
    lastname : zod.string().optional()
})

router.put("/", authMiddleware ,async (res,req)=>{
    const { success } = updateBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne({_id: req.userId},req.body)

    res.json({
        message : "Updated Successfully"
    })

})

router.get("/bulk",async (res,req)=>{

    const filter = req.query.filter || "" ;

    const users = await User.find({
        $or: [{
            firstname : {
                "$regex" : filter
            }
        },{
            lastname :{
                "$regex" : filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstname : user.firstname,
            lastname : user.lastname,
            _id : user._id
        }))
    })

})

module.exports = router;