import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import Pusher from "pusher"
import Messages from "./dbMessage.js"

//app config
const app=express()
const port =process.env.PORT||8080


const pusher = new Pusher({
    appId: "1238208",
    key: "ab493482f30a2b3bcc7c",
    secret: "a05696ca950d5b3a97ca",
    cluster: "ap2",
    usetLS: true
  });
  
//middleware
app.use(cors())
// secure messages
app.use((req,res,next)=>{
    res.setHeader("Acess-Control-Allow-Origin", "*")
    res.setHeader("Acess-Control-Allow-Headers", "*")
    next()
})
app.use(express.json())


//db config

const connection_url='mongodb+srv://admin:bcM96pYrGEzfbbDG@cluster0.go0kz.mongodb.net/insta?retryWrites=true&w=majority'

mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
})

const db=mongoose.connection

db.once('open',()=>{
    console.log("db is connected")
    const messages=db.collection("messages")
    const change=messages.watch()

    change.on('change',(change)=>{
        console.log(change);

        if(change.operationType === "insert"){
            const messageDetails=change.fullDocument;
            pusher.trigger('messages','inserted',{
                name:messageDetails.user,
                messages:messageDetails.message,
                timestamp:messageDetails.timestamp,
                received:messageDetails.received,
            })
        }else{
            console.log("error i...")
        }
    })
})
//api routes

app.get("/",(req,res)=>res.status(200).send("hello world from mern"))

app.post("/messages/new",(req,res)=>{
    const dbModel=req.body;

    Messages.create(dbModel,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})
app.get("/messages/sync",(req,res)=>{
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

//listen
app.listen(port,()=>console.log(`the port is listening on ${port}`))