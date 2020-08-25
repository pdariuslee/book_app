'use strict';

// ============ packages ============

const express = require('express');
// const superagent = require('superagent');



// ============ global vars ============

const PORT = process.env.PORT || 3003;
const app = express();


// ============ express configs ============

app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));

app.get('/hello', (req,res) => {
  res.render('pages/index');
});


app.get('/searchBy', (req, res) => {
  res.render('pages/searches/new');
});

// ============ start server ============


app.listen(PORT, () => console.log(`we are running on PORT : ${PORT}`));