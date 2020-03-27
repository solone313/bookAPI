const express = require('express');
const router = express.Router();
const { Book } = require("../models/Book");
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs'); 
const path = require('path');
const AWS = require("aws-sdk");
const {AWS_ACCESS_KEY,AWS_SECRET_ACCESS_KEY} = require("../config/key");
AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region : 'ap-northeast-2'
});

var s3 = new AWS.S3();

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.png') {
            return cb(res.status(400).end('only png is allowed'), false);
        }
        cb(null, true)
    }
})
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "goreads", // 버킷 이름
        contentType: multerS3.AUTO_CONTENT_TYPE, // 자동을 콘텐츠 타입 세팅
        acl: 'public-read', // 클라이언트에서 자유롭게 가용하기 위함
        key: (req, file, cb) => {
            cb(null, file.originalname)
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 용량 제한
}).single('img');


router.post('/uploadfiles', (req, res) => {
    // 사진을 서버에 저장한다.
    upload(req, res, err => {
        // console.log('req이다',res.req.file);
        if(err) {
            return res.json({success:false, err})
        }
        return res.json({success:true, url: res.req.file.location, fileName: res.req.file.originalname})
    })
})

router.post('/uploadBook', (req, res) => {
    // console.log(req.body)
    const book = new Book(req.body)
    
    book.save((err,doc)=>{
        if(err) return res.json({success:false,err})
        // console.log(doc)
        res.status(200).json({success:true})
    })
})
router.get('/getbooks', (req, res) => {

   //책을 DB에 가져와서 클라이언트에 보낸다
   Book.find()
        .populate('writer')
        .exec((err, books)=>{
            if(err)return res.status(400).send(err);
            res.status(200).json({success:true, books})
        })
})




module.exports = router;
