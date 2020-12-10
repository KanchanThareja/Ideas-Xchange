const express = require('express');
const checkAuth = require('../middleware/check-auth');
const PostsControllers = require('../controllers/posts');
const extractFile =require('../middleware/file');
const router = express.Router();

router.post("", checkAuth, extractFile, PostsControllers.addPost);
router.put("/:id", checkAuth, extractFile, PostsControllers.updatePost);
router.get('', PostsControllers.fetchPost);
router.get("/:id", PostsControllers.fetchPostByID);
router.delete("/:id", PostsControllers.deletePost);

module.exports = router;
