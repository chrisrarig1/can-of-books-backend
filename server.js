'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3001;



app.get('/test', (request, response) => {

  response.send('test request received');
});

app.get('/', (request, response) => {

  response.send('test request received');
});

app.get('/clear', clearDB);
app.get('/seed', sample);
app.get('/books',findBook);

mongoose.connect(process.env.MONGO_CONNECTION_STRING,
  { useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log('db is connected'));

app.listen(PORT, () => console.log(`listening on ${PORT}`));


let Book = require('./modules/schema.js');


function sample(request,response){
  const seed = [
    {title: 'Catcher in the Rye',description: 'yup',status: 'AVAIABLE',email:'cwrarig20@gmail.com',},
    {title: 'Enders Game',description: 'space',status: 'NOT AVAIABLE',email:'cwrarig20@gmail.com',},
    {title: 'The Shining',description: 'horror',status: 'NOT AVAIABLE',email:'cwrarig20@gmail.com',}
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
  if(request.query.email) {
    let { email } = request.query;
    let filterQ = {};
    filterQ.email= email;
    const item = await Book.find(filterQ);
    response.status(200).send(item);
  }
  else{
    response.status(200).send([]);
  }
}


