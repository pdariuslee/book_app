'use strict';

// ============ packages ============

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();




// ============ global vars ============

const PORT = process.env.PORT || 3003;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (error) => console.error(error));

// ============ express configs ============

app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));


// ============ routes  ============


app.get('/books/:id', retrieveSingleBook);

app.get('/', retrieveArrOfBooks);

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});

app.post('/searches', sendGoogleBooksApiData);

app.post('/books', addBookToDB);



// ============ functions  ============

function addBookToDB(req, res){

  // console.log(req.body.booksOptions);
  const {author, title, isbn, image_url, description, categories} = req.body;

  // console.log({author, title, isbn, image_url, description});



  const SQL = `INSERT INTO books 
    (author, title, isbn, image_url, description, categories) 
    VALUES($1, $2, $3, $4, $5, $6) RETURNING id`;
  const valuesArray = [author, title, isbn, image_url, description, categories];

  client.query(SQL, valuesArray).then((dbResult) => {
    // throw new Error('you done goofed');

    const newID = dbResult.rows[0].id;

    res.redirect(`/books/${newID}`);
  }).catch((error) => handleError(error, res));

}


function handleError(error, res){
  console.error(error);
  res.render('pages/errors', {error});
}


function retrieveSingleBook(req, res){


  client.query('SELECT * FROM books WHERE id=$1', [req.params.id])
    .then(result => {

      // console.log(result.rows[0]);
      res.render('pages/books/detail', {id : result.rows[0]});
    }).catch((error) => handleError(error, res));


}

function retrieveArrOfBooks(req, res){

  client.query('SELECT * FROM books')
    .then(result => {

      // console.log(result.rows.length);

      let countBooks = result.rows.length;

      res.render('pages/index', {
        itemObjectArray : result.rows,
        numOfBooksInDB : countBooks
      });
    }).catch((error) => handleError(error, res));

}



function sendGoogleBooksApiData(req, res){

  let searchQuery;

  let urlToGoogleApi = ``;

  if(req.body.title){
    searchQuery = req.body.title;
    urlToGoogleApi = `https://www.googleapis.com/books/v1/volumes?q=+intitle:${searchQuery}`;
  } else{
    searchQuery = req.body.author;
    urlToGoogleApi = `https://www.googleapis.com/books/v1/volumes?q=+inauthor:${searchQuery}`;
  }

  superagent.get(urlToGoogleApi)
    .then( apiData => {

      // res.send(apiData.body.items);
      // throw new Error('this is my error');

      const gApiData = apiData.body.items.map( data => new Book(data));

      // res.send(gApiData);

      res.render('pages/searches/show', {
        itemObjectArray : gApiData
      });

    })
    .catch(error => {

      res.render('pages/error');
    });

}



// ============ constructor   ============

function Book(obj){

  const data = obj.volumeInfo;

  this.title = data.title;
  this.author = data.authors;
  this.isbn = data.industryIdentifiers[0].identifier;
  this.description = data.description;
  this.image_url = data.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpg';
  this.categories = data.categories;

}


// ============ start server ============


client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`we did it, its up on ${PORT}`));
  });