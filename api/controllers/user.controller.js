import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';
import cloudinary from '../config/cloudinary.js';
import mongoose from 'mongoose';
import Post from '../models/post.model.js';

export const test = (req, res) => {
  res.json({ message: 'API is working' });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(403, "Password must be atleast 6 characters"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(errorHandler(400, "Username must between 7 and 20 characters only"));
    }
    if (req.body.username.includes(' ')) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, 'Username must be lowercase'));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(errorHandler(400, 'Username can only contain letters and numbers'));
    }
  }

  // Only set the fields that were actually sent, so an email- or password-only
  // update never touches the username (and always gets a response).
  const updates = {};
  if (req.body.username) updates.username = req.body.username;
  if (req.body.email) updates.email = req.body.email;
  if (req.body.password) updates.password = req.body.password;

  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, {
      $set: updates,
    }, { new: true });

    if (!updatedUser) {
      return next(errorHandler(404, 'User not found'));
    }

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }
  if (!req.file) {
    return next(errorHandler(400, 'No image file provided'));
  }
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // Delete old Cloudinary image if exists
    if (user.profilePicturePublicId) {
      await cloudinary.uploader.destroy(user.profilePicturePublicId);
    }

    // Upload new image from buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'avatars', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          profilePicture: uploadResult.secure_url,
          profilePicturePublicId: uploadResult.public_id,
        }
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to deleted this account"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json('User has been deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res.clearCookie('access_token').status(200).json('User has been signed-out');
  } catch (error) {
    next(error);
  }
};

export const getusers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to see all users'));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWitoutpassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();
    const oneMonthago = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    );

    const lastMonthusers = await User.countDocuments({
      createdAt: { $gte: oneMonthago },
    });

    res.status(200).json({
      users: usersWitoutpassword,
      totalUsers,
      lastMonthusers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// ── Save for later ──────────────────────────────────────────────
export const getSavedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('savedPosts');
    if (!user) return next(errorHandler(404, 'User not found'));
    const ids = (user.savedPosts || []).filter(id => mongoose.Types.ObjectId.isValid(id));
    const posts = await Post.find({ _id: { $in: ids } });
    // newest saved first; posts deleted since saving simply drop out
    const order = new Map(ids.map((id, i) => [id, i]));
    posts.sort((a, b) => order.get(b._id.toString()) - order.get(a._id.toString()));
    res.status(200).json({ posts });
  } catch (error) {
    next(error);
  }
};

export const toggleSavedPost = async (req, res, next) => {
  const { postId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return next(errorHandler(400, 'Invalid post'));
  }
  try {
    const user = await User.findById(req.user.id).select('savedPosts');
    if (!user) return next(errorHandler(404, 'User not found'));
    const alreadySaved = user.savedPosts.includes(postId);
    if (!alreadySaved && !(await Post.exists({ _id: postId }))) {
      return next(errorHandler(404, 'Post not found'));
    }
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      alreadySaved ? { $pull: { savedPosts: postId } } : { $addToSet: { savedPosts: postId } },
      { new: true }
    ).select('savedPosts');
    res.status(200).json({ saved: !alreadySaved, savedPosts: updated.savedPosts });
  } catch (error) {
    next(error);
  }
};
