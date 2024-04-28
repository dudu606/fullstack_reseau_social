const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const userRoutes= require('./routes/user.routes.js');
require('./config/db');
require('dotenv').config({path: './config/.env'});
const rateLimit = require('express-rate-limit');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//routes

app.use('/api/user', userRoutes);




//server
app.listen(process.env.PORT, ()  => {
    console.log(`Listening port ${process.env.PORT}`);
});


// Limiter à 1000 requêtes par heure par adresse IP
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 1000, // Nombre maximal de requêtes par fenêtre
    message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.'
  });
  
  // Appliquer la limite des taux à toutes les requêtes
  app.use(limiter); 

