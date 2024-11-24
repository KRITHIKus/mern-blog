import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userRoutes from './routes/user.route.js'
import authRoutes from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'
import PostRoutes from './routes/post.route.js'


dotenv.config()
mongoose.
connect( process.env.MONGO)
      .then(()=>{
    console.log('Monogo db is connected')
})
.catch((err)=>{
    console.log(err)
});

const app= express()
app.use(express.json())
app.use(cookieParser())

app.listen(3000,()=>{
    console.log("server is running on port 3000!!!")
}

)

app.use('/api/user',userRoutes)
app.use('/api/auth',authRoutes)
app.use('/api/post',PostRoutes)



app.use((err,req, res, next) =>{
    const statusCode = err.statusCode || 500;
    const message = err.message || 'internal server error';
    res.status(statusCode).json({
        success:false,
        statusCode,
        message
    });
});