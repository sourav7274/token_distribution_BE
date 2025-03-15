
require('./db_connetion/db_connection')
require('dotenv').config()

const crypto = require('crypto')
const express = require('express')
const cookie  = require('cookie-parser')

const app = express()
const cors = require('cors')
const corsOption = {
    origin: "http://localhost:5173",
    credentials:true,
    optionSuccessStatus: 200
}

app.use(cors(corsOption))
app.use(express.json())
app.use(cookie())


const Token = require('./models/token.model')

const makeToken = () =>{
    return crypto.randomBytes(8).toString('hex')
}

app.post('/claimToken', async (req,res) =>{
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const coolDOwn = 5*60*1000
    const newToken  = makeToken()
    console.log(ip)
    const data = {
        code:newToken,
        claimedBy:ip      
    }
   
    // console.log("Client IP:", ip,data);
    try{

        if(req.cookies.lastClaim)
        {
            const lastCLaimTIme = parseInt(req.cookies.lastCLaim)
            const timeLeft = Date.now() - lastCLaimTIme
            const coolDownTIme = coolDOwn - timeLeft
            
            if(timeLeft > 0)
            {
                res.status(200).json({message:"Too soon",coolDownTIme})
            }
        
        }   

        const latestClaim = await Token.findOne({claimedBy: ip}).sort({lastClaimed: -1})
        // console.log(latestClaim)
        if(latestClaim)
        {
            const lastCLaim= Date.now() - new Date(latestClaim.lastClaimed).getTime()
            const timeLeft = coolDOwn - lastCLaim
            if(timeLeft <= 0)
            {
                console.log("U can claim the token")
                const newClaim = new Token(data)
                await newClaim.save()
        
                if(newClaim)
                {
                    res.status(201).json({message:"Token CLaim Success",token:newToken})
                }   
               else
               {
                res.status(400).json({message:"Token Claim failed"})
               }
            }
            else
            {
               res.status(200).json({error:"Too soon",timeLeft})
            }
        }

        else{
            const newClaim = new Token(data)
            await newClaim.save()
    
            if(newClaim)
            {
                res.cookie('lastClaim',Date.now(),{maxTime:coolDOwn,httpOnly: true})
                res.status(201).json({message:"Token CLaim Success",token:newToken})
            }   
           else
           {
            res.status(400).json({message:"Token Claim failed"})
           }
        }
    } catch(err)
    {
        res.status(500).json({error:"Internal Server Error"})
    }
})


const PORT = process.env.PORT || 4000
app.listen(PORT,"0.0.0.0",() =>{
    console.log("Serving running on",PORT)
})