const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const { auth } = require("../middleware/auth");
const { OAuth2Client } = require("google-auth-library");
const config = require("../config/key");
const { Comment } = require("../models/Comment");
const { Book } = require("../models/Book");
const { Subscriber } = require("../models/Subscriber");

//=================================
//             User
//=================================
router.get("/auth", auth, (req, res) => {
  res.status(200).json({
      _id: req.user._id,
      isAdmin: req.user.role === 0 ? false : true,
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image,
      company: req.user.company
  });
});

router.post("/register", (req, res) => {

  const user = new User(req.body);

  user.save((err, doc) => {
      // console.log(doc)
      if (err) return res.json({ success: false, err });
      return res.status(200).json({
          success: true
      });
  });
});

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.account }, (err, user) => {
      if (!user)
          return res.json({
              loginSuccess: false,
              message: "Auth failed, account not found"
          });

      user.comparePassword(req.body.password, (err, isMatch) => {
          if (!isMatch)
              return res.json({ loginSuccess: false, message: "Wrong password" });

          user.generateToken((err, user) => {
              if (err) return res.status(400).send(err);
              res.status(200).json({
                  loginSuccess: true, userId: user._id,
                  tokenExp: user.tokenExp, token: user.token,
                  company: user.company
              });
          });
      });
  });
});

router.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
          success: true
      });
  });
});

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);
router.post("/googleLogin", (req, res) => {
  const idToken = req.body.tokenId;
  client
    .verifyIdToken({ idToken, audience: config.GOOGLE_CLIENT_ID })
    .then(response => {
      // console.log(response,'verifyIdToken')
      const { email_verified, name, email, jti, given_name } = response.payload;
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            // console.log(user,'asd')
            user.generateToken((err, user) => {
              if (err) return res.status(400).send(err);
              res.status(200).json({
                  loginSuccess: true, userId: user._id,
                  tokenExp: user.tokenExp, token: user.token,
                  msg: "로그인에 성공했습니다."
              });
            });
          } else {
            let nickname = given_name;
            let password = jti;
            user = new User({ name, email, nickname, password });
            user.save((err, user) => {
              if (err) {
                return res.status(400).json({
                  loginSuccess: false,
                  error: err
                });
              }
              user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.status(200).json({
                    loginSuccess: true, userId: user._id,
                    tokenExp: user.tokenExp, token: user.token,
                    msg: "가입에 성공했습니다."
                });
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Google login failed. Try again."
        });
      }
    });
});


router.post("/deleteuser", (req, res) => {
  console.log(req.body._id);
  Book.deleteMany({writer: req.body._id}, (err,doc) =>{
    // console.log('1')
    if (err) return res.json({ success: false, err });
    Comment.deleteMany({writer: req.body._id}, (err, doc) => {
      // console.log('2')
      if (err) return res.json({ success: false, err });
      Subscriber.deleteMany({userFrom: req.body._id}, (err, doc) => {
        // console.log('3')
        if (err) return res.json({ success: false, err });
        User.findOneAndDelete({ _id: req.body._id }, (err,doc) =>{
          // console.log('4')
          if (err) return res.json({ success: false, err });
          return res.status(200).send({
            success: true
          });
        })
      })
    })
  })

});

router.post("/profilecomment", (req, res) => {
  Comment.find({ writer: req.body._id})
  .populate("postId")
  .exec((err,profilecomments)=>{
    //  console.log(req.body)
     if(err) return res.status(400).send(err);
     res.status(200).json({success:true, profilecomments})
  })
})

router.post("/profilebook",(req,res)=>{
   Book.find({writer: req.body._id})
   .exec((err,profilebooks)=>{
    //  console.log(req.body)
     if(err) return res.status(400).send(err);
     res.status(200).json({success:true,profilebooks})
   })
})

module.exports = router;
