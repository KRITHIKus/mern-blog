import mongoose from "mongoose"; 

const commentSchema = new mongoose.Schema({
    content:{
       type: String,
       required: true,
       trim: true,
    },
    postId: {
        type: String,
        required: true,
        index: true,
    },
    userId: {
        type: String,
        required: true,
    },
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
        index: true,
    },
    likes: {
       type: Array,
       default: [],
    },
    numberOfLikes:{
        type: Number,
        default: 0,
    },
    isDeleted: {
  type: Boolean,
  default: false,
},
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;