const express = require('express');
var app = express();

const fs = require('fs')
// hashpassword
const bcrypt = require('bcrypt');
// back and front
const cors = require('cors');
app.use(cors());
// create token //
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


app.post('/api/signup',async function   (req, res) {
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
          user.password = hash;
          user.save((error) => {
              if (error) {
                  // handle error
              } else {
                  // password has been hashed and user has been saved successfully
              }
          });
      }
  })

    User.findOne({tel: DataUser.tel}).then(existingUser => {
      if (existingUser) {
        return res.status(409).send('User already exists');
      }
      DataUser.save().then(() => {
        console.log('User saved');
        res.redirect('http://localhost:3000/login');
      });
    });
  })





app.post('/api/login', function(req, res) {
  User.findOne({
      email : req.body.email
  }).then(user => {
      if (!user){
          res.status(404).send('Email Invalid !');
      } else {
          bcrypt.compare(req.body.password, user.password, function(err, result) {
              if (!result) {
                  res.status(404).send('Password Invalid !');
              } else {
                  const accessToken = createToken(user);
                  res.cookie("access-token", accessToken, {maxAge: 60*60*24*30*12, httpsOnly:true});
                  res.redirect("http://localhost:3000/homepage");
              }
          });
      }
  }).catch(err => {console.log(err)});
});



app.get('/allusers', function(req, res) {
    User.find().then(data => {
        res.json({data: data});
    }).catch(err => {console.log(err)});
    })

    app.post('/logout', (req, res) => {
        req.session.destroy((err) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error logging out');
          }
          return res.send('Logged out successfully');
        });
      });


      

    // app.put('/user' , async (req, res) => {
    //     const formData = req.body.formData;
        
    //     const query = {user_id: formData.user_id}
    //     const updateDocument = {
    //         $set: {
    //             username: formData.username,
    //             dob_day: formData.dob_day,
    //             dob_month: formData.dob_month,
    //             dob_year: formData.dob_year,
    //             gender_identity: formData.gender_identity,
    //             gender_interest: formData.gender_interest,
    //             url: formData.url,
    //             matches:formData.matches
    //         }
    //     }
    //     const insertedUser = await User.updateOne(query, updateDocument)
    //     res.send(insertedUser)
    // }
    
    // )