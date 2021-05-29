'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');


const notFoundHandler = require('./error-handlers/404.js');
const errorHandler = require('./error-handlers/500.js');
const logger = require('./middleware/logger.js');
const authRoutes = require('./auth/routes.js');
const oauth = require('./auth/oauthroutes'); // oauth


const v1Routes = require('./routes/v1.js');
const v2Routes = require('./routes/v2.js');

const app = express();
app.set('view engine', 'ejs');


app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authRoutes);
app.use(oauth);

app.use(logger);

app.get('/', (req,res)=>{
  res.send('Welcome to Auth App :)');
});



module.exports = {
  server: app,
  start: port => {
    if ( !port ) { throw new Error( 'Missing Port' ); }
    app.listen( port, () => console.log( `Listening on ${port}` ) );
  },
};



app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

app.use('*', notFoundHandler);
app.use(errorHandler);

module.exports = {
  server: app,
  start: port => {
    if (!port) { throw new Error('Missing Port'); }
    app.listen(port, () => console.log(`Listening on ${port}`));
  },
};

