require('dotenv').config();

//import modules for my project
const express = require('express');
const bodyParser = require('body-parser');


// save server instance into a variable
const app = express();

// add important ports to use API
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./app/controllers/index')(app);

// start app listen to port 
app.listen(process.env.PORT)