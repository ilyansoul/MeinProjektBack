const express = require('express');
var app = express();
const request = require('express').request;
const fs = require('fs')
// hashpassword
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid')

// back and front
const cors = require('cors');
app.use(cors());
// create token //
const jwt = require('jsonwebtoken')
const {createToken , validateToken} = require('./JWT')
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json());
//
// const { request } = require('express');
const saltRounds = 10;
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
const { MongoClient} = require('mongodb')
// const uri = 'mongodb+srv://ilyan17:ilyan17@cluster0.xtjt56g.mongodb.net/Find?retryWrites=true&w=majority'
mongoose.set('strictQuery', false)
mongoose.connect(dbURL, {
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
    cb(null, path.join(`${__dirname}/public`));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// app.post('/api/profile', upload.array('imageUrls', 9), (req, res) => {
//   console.log(req.files);
//   res.send('Files uploaded successfully');
// });



app.get('/users', async (req, res) => {
  const client = new MongoClient(dbURL)

  try {
    await client.connect()
    const database = client.db('Find')
    const users = database.collection('users')
    const returnedUsers = await users.find().toArray()
    res.send(returnedUsers)
  } finally {
    await client.close()
  }
})

app.post('/api/signup', async (req, res) => {
  const client = new MongoClient(dbURL, { useNewUrlParser: true });

  try {
    await client.connect();
    const database = client.db('Find');
    const users = database.collection('users');

    const {
      username,
      email,
      tel,
      password,
      imageUrls,
      dob_day,
      dob_month,
      dob_year,
      gender_identity,
      gender_interest,
    } = req.body;

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const generaredUserId = uuidv4();

    const sanitizedEmail = email.toLowerCase();
    const data = {
      user_id: generaredUserId,
      username,
      email: sanitizedEmail,
      tel,
      password: hashedPassword,
      imageUrls,
      dob_day,
      dob_month,
      dob_year,
      gender_identity,
      gender_interest,
    };

    const insertedUser = await users.insertOne(data);


    const token = jwt.sign({user_id: generaredUserId, email: sanitizedEmail}, process.env.SECRET_KEY, {
      expiresIn: 60 * 24,
     })
    res.cookie('token', token, { httpOnly: true }).redirect('http://localhost:3000/login');  
    // res.status(201).json({ token, userId: generaredUserId})
  
  } 
    
    catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to sign up user' });
  } finally {
    client.close();
  }
});



app.post('/api/login', async (req, res) => {
  const client = new MongoClient(dbURL)
  const {email, password} = req.body

  try {
      await client.connect()
      const database = client.db('Find');
      const users = database.collection('users');

      const user = await users.findOne({email})

      const correctPassword = await bcrypt.compare(password, user.password)

      if (user && correctPassword) {
          const token = jwt.sign(user, email, {
              expiresIn: 60 * 24
          })
          return res.redirect('http://localhost:3000/homepage')
      }

      return res.status(400).json('Invalid Credentials')

  } catch (err) {
      console.log(err)
  } finally {
      await client.close()
  }
})

app.get('/contact/:id', function(req, res){
  Contact.findOne(
      {
          _id: req.params.id
      }).then(data => {
          res.render('Edit', {data: data});
      }).catch(err => { console.log(err) });
});

app.put('/users/:id', function(req, res){
  Contact.findOne(
      {
          user_id: req.params.id
      }).then(data => {
        data.username = req.body.username,
        data.email = req.body.email,
        data.tel = req.body.tel,
        data.password = req.body.password,
        data.dob_day = req.body.dob_day,
        data.dob_month = req.body.dob_month,
        data.dob_year = req.body.dob_year,
        data.gender_identity = req.body.
       data.gender_interest = req.body.gender_interest,
          data.save().then(()=>{
              console.log("Data changed !");
              res.redirect('/');
          }).catch(err => console.log(err));

      }).catch(err => { console.log(err) });
});