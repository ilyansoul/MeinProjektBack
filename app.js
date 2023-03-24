const express = require('express');
var app = express();
const request = require('express').request;
const fs = require('fs')
// hashpassword
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid')

// back and front

const cors = require('cors');
app.use(cors({
  origin: 'https://front-ij31.onrender.com', 
  credentials : true,

}
  ));

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://front-ij31.onrender.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
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
let port = process.env.PORT;
// put the port localhost at 5000
const server = app.listen(port, function () {
    console.log('server listening on port ' + port)
})



// pre before connect mongodb
const mongoose = require('mongoose');
const { MongoClient} = require('mongodb')
// const dbURL = 'mongodb+srv://ilyan17:ilyan17@cluster0.xtjt56g.mongodb.net/Find?retryWrites=true&w=majority'
mongoose.set('strictQuery', false)
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(console.log("MongoDB Connected !"))
.catch(err => console.log("error : " + err));


app.get('/',  (req , res) => {
  res.send('Welcome on my backend')
} )

app.post('/signup', async (req, res) => {
  const client = new MongoClient(dbURL)
  const { email, password } = req.body

  const generatedUserId = uuidv4()
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
      await client.connect()
      const database = client.db('app-data')
      const users = database.collection('users')

      const existingUser = await users.findOne({ email })

      if (existingUser) {
          return res.status(409).send('User already exists. Please login')
      }

      const sanitizedEmail = email.toLowerCase()

      const data = {
          user_id: generatedUserId,
          email: sanitizedEmail,
          hashed_password: hashedPassword
      }

      const insertedUser = await users.insertOne(data)

      const token = jwt.sign(insertedUser, sanitizedEmail, {
          expiresIn: 60 * 60 * 24 * 60
      })
      res.status(201).json({ token, userId :generatedUserId, email: sanitizedEmail })

  } catch (err) {
      console.log(err)
  } finally {
      await client.close()
  }
})



app.post('/login', async (req, res) => {
  const client = new MongoClient(dbURL)
  const {email, password} = req.body

  try {
    await client.connect()
    const database = client.db('app-data')
    const users = database.collection('users')

    const user = await users.findOne({email})

    const correctPassword = await bcrypt.compare(password, user.hashed_password)

    if (user && correctPassword) {
      const token = jwt.sign(user, email, {
        expiresIn: 60 * 24
      })
      res.status(201).json({token, userId: user.user_id})
    } else {
      res.status(400).json('Invalid Credentials')
    }

  } catch (err) {
    console.log(err)
  } finally {
    await client.close()
  }
})

app.get('/gendered-users', async (req, res) => {
  const client = new MongoClient(dbURL)
  const gender = req.query.gender
;

  try {
      await client.connect()
      const database = client.db('app-data')
      const users = database.collection('users')
      const query = {gender_identity: {$eq: gender}}
      const foundUsers = await users.find(query).toArray()
      res.json(foundUsers)

  } finally {
      await client.close()
  }
})



app.get('/users', async (req, res) => {
  const client = new MongoClient(dbURL)

  try {
    await client.connect()
    const database = client.db('app-data')
    const users = database.collection('users')
    const returnedUsers = await users.find().toArray()
    res.send(returnedUsers)
  } finally {
    await client.close()
  }
})


app.get('/user', async (req, res) => {
  const client = new MongoClient(dbURL)
  const userId = req.query.userId

  try {
      await client.connect()
      const database = client.db('app-data')
      const users = database.collection('users')

      const query = {user_id: userId}
      const user = await users.findOne(query)
      res.send(user)

  } finally {
      await client.close()
  }
})

app.put('/user', async (req, res) => {
  const client = new MongoClient(dbURL)
  const formData = req.body.formData

  try {
      await client.connect()
      const database = client.db('app-data')
      const users = database.collection('users')

      const query = { user_id: formData.user_id }

      const updateDocument = {
          $set: {
              first_name: formData.first_name,
              dob_day: formData.dob_day,
              dob_month: formData.dob_month,
              dob_year: formData.dob_year,
              show_gender: formData.show_gender,
              gender_identity: formData.gender_identity,
              gender_interest: formData.gender_interest,
              url: formData.url,
              about: formData.about,
              matches: formData.matches
          },
      }

      const insertedUser = await users.updateOne(query, updateDocument)

      res.json(insertedUser)

  } finally {
      await client.close()
  }
})

app.put('/addmatch', async (req, res) => {
  const client = new MongoClient(dbURL)
  const {userId, matchedUserId} = req.body

  try {
      await client.connect()
      const database = client.db('app-data')
      const users = database.collection('users')

      const query = {user_id: userId}
      const updateDocument = {
          $push: {matches: {user_id: matchedUserId}}
      }
      const user = await users.updateOne(query, updateDocument)
      res.send(user)
  } finally {
      await client.close()
  }
})



app.get('/gendered-users', async (req, res) => {
  const client = new MongoClient(dbURL)
  const matches = req.query.matches
;

  try {
      await client.connect()
      const database = client.db('app-data')
      const users = database.collection('users')
      const query = {matches: matches}
      const foundUsers = await users.find(query).toArray()
      res.json(foundUsers)

  } finally {
      await client.close()
  }
})
app.get('/users', async (req, res) => {
  const client = new MongoClient(dbURL)
  const userIds = JSON.parse(req.query.userIds)

  try {
    await client.connect()
    const database = client.db('app-data')
    const users = database.collection('users')

    const user = await users.findOne({ user_id: userIds })

    if (!user) {
      res.json([])
      return
    }

    // Next, find all the users with user_id's in the user's "matches" array
    const matchIds = user.matches
    const foundMatches = await users.find({ user_id: { $in: matchIds } }).toArray()

    // Finally, extract the "matches" field from each match user and send it back to the client
    const matches = foundMatches.map(match => match.matches)
    res.json(matches)
  } finally {
    await client.close()
  }
})

app.get('/messages', async (req, res) => {
  const { userId, correspondingUserId } = req.query;
  const client = new MongoClient(dbURL);

  try {
      await client.connect();
      const database = client.db('app-data');
      const messages = database.collection('messages');

      const query = {
        $or: [
            { from_userId: userId, to_userId: correspondingUserId },
            
        ]
    }

      const foundMessages = await messages.find(query).toArray();
      res.send(foundMessages);
  } finally {
      await client.close();
  }
});

app.post('/message', async (req, res) => {
    const client = new MongoClient(dbURL)
    const message = req.body.message

    try {
        await client.connect()
        const database = client.db('app-data')
        const messages = database.collection('messages')

        const insertedMessage = await messages.insertOne(message)
        res.send(insertedMessage)
    } finally {
        await client.close()
    }
})


app.put('/edit', async (req, res) => {
  const client = new MongoClient(dbURL)
  const editData = req.body.editData

  try {
      await client.connect()
      const database = client.db('app-data')
      const users = database.collection('users')

      const query = { user_id: editData.user_id }

      const updateDocument = {
          $set: {
             
              url: editData.url,
              about: editData.about,
          },
      }

      const insertedUser = await users.updateOne(query, updateDocument)

      res.json(insertedUser)

  } finally {
      await client.close()
  }
})


app.put('/api/store-location', async (req, res) => {
  const client = new MongoClient(dbURL)

  const { lat, lng, user_id } = req.body;

  try {
    await client.connect()
    const database = client.db('app-data')
    const location = database.collection('localisation')

    const query = { user_id: user_id }

    const updateDocument = {
        $set: {
            lat: lat,
            lng: lng,
        },
    }
console.log(query);
console.log(updateDocument);
console.log(insertedUser);
    const insertedUser = await location.updateOne(query, updateDocument)

    res.send(insertedUser);

} finally {
    await client.close()
}

});