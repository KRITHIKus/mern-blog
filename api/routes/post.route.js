import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, getposts, deletepost, updatepost, uploadPostImage } from '../controllers/post.controller.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/create', verifyToken, create);
router.post('/upload-image', verifyToken, upload.single('image'), uploadPostImage);
router.get('/getposts', getposts);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);

export default router;