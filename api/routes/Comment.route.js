import express from 'express';
import {verifyToken} from '../utils/verifyUser.js'
import { createComment } from '../controllers/comment.controller.js';
import { getPostComments, likeComment, editComment,deleteComment, getcomments, getMyActivity } from '../controllers/comment.controller.js';


const router = express.Router();

router.post('/create',verifyToken, createComment)
router.get('/getPostComments/:postId',getPostComments)
router.put('/likeComment/:commentId', verifyToken, likeComment)
router.put('/editComment/:commentId', verifyToken, editComment)
router.delete('/deleteComment/:commentId', verifyToken, deleteComment);
router.get('/getcomments',verifyToken,getcomments)
router.get('/activity', verifyToken, getMyActivity)

export default router;