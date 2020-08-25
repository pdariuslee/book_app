'use strict';

// ============ packages ============

const express = require('express');
const superagent = require('superagent');



// ============ global vars ============

const PORT = process.env.PORT || 3003;
const app = express();


// ============ express configs ============

app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));

// app.get('/hello', (req,res) => {
//   res.render('pages/index');
// });

app.use(express.static('./views/pages/searches'));
app.use(express.urlencoded({extended: true}));


app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});

// ============ routes  ============



function sendGoogleBooksApiData(req, res){

  // res.render('pages/searches/new');

  // console.log(req.body.volumeInfo);

  let searchQuery = req.body.title;

  // console.log('wutttttt ' + searchQuery);

  // const urlToGoogleApi = `https://www.googleapis.com/books/v1/volumes?q=${search_query}`;


  const urlToGoogleApi = `https://www.googleapis.com/books/v1/volumes?q=+intitle:${searchQuery}`;

  superagent.get(urlToGoogleApi)
    .then( apiData => {

      // res.send(apiData.body.items);
      // console.log(apiData.body.items[0].volumeInfo);

      // console.log(apiData.body.items[0].volumeInfo.title);

      // res.send(apiData.body.items[1].volumeInfo);



      const gApiData = apiData.body.items.map( data => new Book(data));

      // console.log(gApiData);
      // res.send(gApiData);

    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    });

}



// ============ other functionalities  ============

function Book(obj){
  this.title = obj.volumeInfo.title;
  this.author = obj.volumeInfo.authors;

}


// ============ start server ============


app.listen(PORT, () => console.log(`we are running on PORT : ${PORT}`));