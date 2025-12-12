const express=require("express");const app=express();app.get("/api/health",(req,res)=>{res.json({status:"ok",message:"API running"})});module.exports=app;
