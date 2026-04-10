import { errorHandler } from "../utils/error.js";
 import Comment from "../models/comment.model.js";

export const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId, parentCommentId = null } = req.body;

    if (userId !== req.user.id) {
      return next(errorHandler(403, 'You are not allowed to create this comment'));
    }

    if (!content || !content.trim()) {
      return next(errorHandler(400, 'Comment content is required'));
    }

    if (parentCommentId) {
  const parentComment = await Comment.findById(parentCommentId);

  if (!parentComment) {
    return next(errorHandler(404, 'Parent comment not found'));
  }

  if (parentComment.postId !== postId) {
    return next(errorHandler(400, 'Reply must belong to the same post'));
  }

  if (parentComment.isDeleted) {
    return next(errorHandler(400, 'Cannot reply to a deleted comment'));
  }
}

    const newComment = new Comment({
      content: content.trim(),
      postId,
      userId,
      parentCommentId,
    });

    await newComment.save();
    res.status(200).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: -1,
    });

    const parentComments = comments.filter(
      (comment) => !comment.parentCommentId
    );

    const nestedComments = parentComments.map((parent) => {
      const replies = comments.filter(
        (comment) =>
          comment.parentCommentId &&
          comment.parentCommentId.toString() === parent._id.toString()
      );

      return {
        ...parent._doc,
        replies: replies.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        ),
      };
    });

    res.status(200).json(nestedComments);
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req, res, next) =>{
    try {
     const comment  = await Comment.findById(req.params.commentId);
if(!comment){
    return next(errorHandler(404, 'Comment not found'))
}

if (comment.isDeleted) {
    return next(errorHandler(400, 'Deleted comments cannot be liked'));
}

const userIndex = comment.likes.indexOf(req.user.id)
        if(userIndex === -1){
            comment.numberOfLikes += 1;
            comment.likes.push(req.user.id)
        }else{
            comment.numberOfLikes -= 1;
            comment.likes.splice(userIndex, 1);
        }
        await comment.save();
        res.status(200).json(comment);
        } catch (error) {
        next(error)
    }
}

export const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }
    if (comment.isDeleted) {
  return next(errorHandler(400, 'Deleted comments cannot be edited'));
}

    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(errorHandler(403, 'You are not allowed to edit this comment'));
    }

    if (!req.body.content || !req.body.content.trim()) {
      return next(errorHandler(400, 'Comment content is required'));
    }

    const editedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content.trim(),
      },
      { new: true }
    );

    res.status(200).json(editedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(errorHandler(403, 'You are not allowed to delete this comment'));
    }

    const hasReplies = await Comment.exists({
      parentCommentId: req.params.commentId,
    });

    if (hasReplies) {
      const deletedComment = await Comment.findByIdAndUpdate(
        req.params.commentId,
        {
          content: 'Comment deleted',
          isDeleted: true,
          likes: [],
          numberOfLikes: 0,
        },
        { new: true }
      );

      return res.status(200).json({
        message: 'Comment deleted successfully',
        comment: deletedComment,
      });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    res.status(200).json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

  export const getcomments = async (req, res, next) => {
    if (!req.user.isAdmin)
      return next(errorHandler(403, 'You are not allowed to get all comments'));
    try {
      const startIndex = parseInt(req.query.startIndex) || 0;
      const limit = parseInt(req.query.limit) || 9;
      const sortDirection = req.query.sort === 'desc' ? -1 : 1;
      const comments = await Comment.find()
        .sort({ createdAt: sortDirection })
        .skip(startIndex)
        .limit(limit);
      const totalComments = await Comment.countDocuments();
      const now = new Date();
      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      const lastMonthComments = await Comment.countDocuments({
        createdAt: { $gte: oneMonthAgo },
      });
      res.status(200).json({ comments, totalComments, lastMonthComments });
    } catch (error) {
      next(error);
    }
  };