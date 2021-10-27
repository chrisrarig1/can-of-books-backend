'use strict';

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {type: String},
  description: {type: String},
  status: {type: String, uppercase: true, enum: ['AVAIABLE','NOT AVAIABLE']},
  email: {type: String},
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;





