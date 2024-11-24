import mongoose from "mongoose";



const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required : true,
        unique: true,
    },
    email:{
        type:String,
        required: true,
        unique: true,

    },
    password:{
        type:String,
        required:true,
    },
    profilePicture:{
        type: String,
        default:"https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png",

    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true}

)

const User= mongoose.model('User', userSchema);

export default User;