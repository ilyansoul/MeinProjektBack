const express = require('express');
var app = express();
const {v4: uuidv4} = require('uuid')
const fs = require('fs')
// hashpassword
const bcrypt = require('bcrypt');
// back and front
const cors = require('cors');
app.use(cors());
// create token //
const jwt = require('jsonwebtoken')
const {createToken , validateToken} = require('./JWT')
const cookieParser = require('cookie-parser');
app.use(cookieParser());
//
const { request } = require('express');

//
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
///use dotenv
require('dotenv').config();
var dbURL = process.env.DATABASE_URL;
// put the port localhost at 5000
const server = app.listen(5000, function () {
    console.log('server listening on port 5000')
})

// pre before connect mongodb
const mongoose = require('mongoose');




mongoose.set('strictQuery', false)
mongoose.connect('mongodb+srv://ilyan17:ilyan17@cluster0.xtjt56g.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(console.log("MongoDB Connected !"))
.catch(err => console.log("error : " + err));
app.get('/', (req, res) => {
    res.json('Hello to my app')
})

//////
//use model user
const User = require('./models/User')
// image upload
const multer = require('multer');
app.use(express.static('public'));

const path = require('path');
const projectRoot = path.resolve();//

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });




app.post('/api/signup', upload.array('imageUrls', 9), (req, res) => {
  console.log(req.files);
  res.send('Files uploaded successfully');
});


app.post('/api/signup', async function   (req, res) {
  const generateduserid = uuidv4()

    console.log(req.body);
    const DataUser = new User({
        user_id: req.body.user_id,
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hash(req.body.password,10 ),
        // password: req.body.password,

        tel: req.body.tel,
        imageUrls: req.body.imageUrls,
        dob_day: req.body.dob_day,
        dov_month: req.body.dov_month,
        dob_year: req.body.dob_year,
        gender_identity: req.body.gender_identity,
        gender_interest: req.body.gender_interest
    })

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      if (err) {
          // handle error
      } else {
          // User.password = hash;
          User.save((error) => {
              if (error) {
                  // handle error
              } else {
                  // password has been hashed and user has been saved successfully
              }
          });
      }
  })

    User.findOne({email: DataUser.email}).then(existingUser => {
      if (existingUser) {
        return res.status(409).send('User already exists');
      }
      // const sanitizedEmail = email.toLowerCase()
      // const data = {
      //   user_id: generateduserid,
      //   email: sanitizedEmail,
      //   password: bcrypt.hash(req.body.password,10 ),
      // }
      // const insertedUser =  User.insertOne(data)

      // const token = jwt.sign()
      DataUser.save().then(() => {
        console.log('User saved');
        res.json(409);
      });
    });
  })
