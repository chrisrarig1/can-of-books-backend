'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3001;
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

var client = jwksClient({
  //jwksUri: Account specific:  settings -> advanced settings -> endpoint -> JSON Web Key Set
  jwksUri: 'https://dev-45qyrjq6.us.auth0.com/.well-known/jwks.json'
});
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}


app.get('/test', (request, response) => {

  response.send('test request received');
});

app.get('/', (request, response) => {

  response.status(200).send('test request received');
});

app.get('/clear', clearDB);
app.get('/seed', sample);
app.get('/books',findBook);
app.post('/books',postBook);


mongoose.connect(process.env.MONGO_CONNECTION_STRING,
  { useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log('db is connected'));

app.listen(PORT, () => console.log(`listening on ${PORT}`));


let Book = require('./modules/schema.js');

async function postBook(req, res) {
  let newBook = req.body;
  console.log(newBook);
  // .status(200).send('Connected');

  try {
    let postEntry = new Book(newBook);
    postEntry.save();
    res.status(200).send(postEntry);
  }

  catch (err) {
    res.status(500).send('error posting: ', err.message);
  }
}

function sample(request,response){
  const seed = [
    {title: 'Catcher in the Rye',description: 'yup',status: 'AVAILABLE',email:'cwrarig20@gmail.com',},
    {title: 'Enders Game',description: 'space',status: 'NOT AVAILABLE',email:'cwrarig20@gmail.com',},
    {title: 'The Shining',description: 'horror',status: 'NOT AVAILABLE',email:'cwrarig20@gmail.com',}
  ];
  seed.forEach(book => {
    let entry = new Book(book);
    entry.save();
  });
  response.status(200).send('Seeded DB');

}


Book.find((err, item) => {
  if (err) return console.error(err);
  console.log(item);
});
 
async function clearDB(request, response){
  try{
    await Book.deleteMany({});
    console.log('DB Cleared');
    response.status(200).send('cleared');
  }
  catch (error){
    console.log('error', error.message);
  }
}

async function findBook(request,response){
  try {
    let filterQ = {};
    if (request.query.status) {
      let { status } = request.query;
      filterQ.status = status;
    }
    const item = await Book.find(filterQ);
    let token = '';
    if (!request.headers.authorization) token = '';
    else {
      token = request.headers.authorization.split([' '])[1];
    }

    jwt.verify(token, getKey, {}, function (err,user) {
      if (err) response.status(500).send(`Invalid Token: ${err.message}`);
      else {
        response.status(200).send(item);
      }
    });

  }
  catch (error) {
    response.status(500).send(`error retrieving equipment data:${error.message}`);
  }
}




app.delete('/books/:id', async (request,response) => {
  try{
    let { id } = request.params;
    let deletedBook = await Book.findByIdAndDelete(id);
    console.log(id);
    response.status(200).send(deletedBook);
  }
  catch(e){
    response.status(500).send(`Book not deleted: ${e.message}`);
  }
});

app.put('/books/:id', async (request,response) => {
  let putObj = request.body;
  let id = request.params.id;
  console.log(id);
  try{
    let updatedBook = await Book.findByIdAndUpdate(id, putObj,{new: true, overwrite: true});
    console.log(updatedBook);
    response.status(200).send(updatedBook);
  }
  catch(e){
    response.status(500).send(`Book not updated: ${e.message}`);
  }
} );