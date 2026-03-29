import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";

export const getStats = async (req, res, next) => {
  try {
    const [users, posts, comments] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
    ]);

    res.status(200).json({
      users,
      posts,
      comments,
    });
  } catch (error) {
    next(error);
  }
};