const Post = require('../models/post');

exports.addPost = (req, res, next) => {
    const url = req.protocol + '://' + req.get("host");
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId
    });
    post.save().then(result => {
        res.status(201).json({
            message: "Post added",
            post: {
                id: result._id,
                ...result
            }
        });
    }).catch(err => {
        res.status(500).json({
            message: "Creating a post failed!"
        })
    });
};

exports.updatePost = (req, res, next) => {
    let imagePath = req.body.imagePath;
     if(req.file) {
         const url = req.protocol + '://' + req.get("host");
         imagePath =  url + "/images/" + req.file.filename
     }
     
     const post = {
         title: req.body.title,
         content: req.body.content,
         imagePath: imagePath,
         creator: req.userData.userId
     };
 
     /// need to add creator field but getting req.userData undefined, to check if only the creator can update/delete the post
     Post.updateOne({_id: req.params.id }, post).then(result => {
         if(result.n > 0)
         res.status(200).json({message: "update succesful"});
         else 
         res.status(401).json({message: "Not Authorized"});
     }).catch(err => {
         res.status(500).json({
             message: "Couldn't update post"
         })
     });
 };

 exports.fetchPost = (req, res, next) => {
    const pageSize = +req.query.pageSize;
    const currPage = +req.query.page;
    const postQuery = Post.find();
  
    let fetchedPosts;
    if(pageSize && currPage) {
      postQuery.skip(pageSize * (currPage - 1)).limit(pageSize);
    }
      postQuery.then(documents => {
          fetchedPosts = documents;
          return Post.count();
      }).then(count => {
          res.status(200).json({
              message: 'Posts fetched successfully',
              posts: fetchedPosts,
              maxPosts: count
          });
      }).catch(err=> {
          res.status(500).json({
              message: "fetching posts failed"
          })
      });
  };


exports.fetchPostByID = (req, res, next) => {
    Post.findById(req.params.id).then(post => {
        if(post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({message: "Not found"})
        }
    }).catch(err => {
        res.status(500).json({
            message: "Post could not be found"
        })
    })
};


exports.deletePost = (req, res, next) => {
    console.log(req)
    Post.deleteOne({_id: req.params.id}).then(result => {
        if(result.n >= 0)
        res.status(200).json({message: 'Post deleted'});
        else 
        res.status(401).json({message: 'Not Authorized'});
    });
};
