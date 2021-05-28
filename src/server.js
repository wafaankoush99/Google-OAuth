'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const notFoundHandler = require('./error-handlers/404.js');
const errorHandler = require('./error-handlers/500.js');
// const logger = require('./middleware/logger.js');
// const authRoutes = require('./auth/routes.js');


// const v1Routes = require('./routes/v1.js');
// const v2Routes = require('./routes/v2.js');

const app = express();
app.set('view engine', 'ejs');


app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(authRoutes);

// app.use(logger);

app.get('/', (req,res)=>{
  res.send('Welcome to Auth App :)');
});





// Google Auth
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '200742256737-mtlbtfjr1dgtqlr0h2thf19p17qk19g4.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);


// Middleware

app.use(cookieParser());
app.use(express.static('public'));

app.get('/authPage', (req, res) => {
  res.render('authHome.ejs');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  let token = req.body.token;

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
  }
  verify()
    .then(() => {
      res.cookie('session-token', token);
      res.send('success');
    })
    .catch(console.error);

});

app.get('/profile', checkAuthenticated, (req, res) => {
  let user = req.user;
  res.render('profile', { user });
});

app.get('/protectedRoute', checkAuthenticated, (req, res) => {
  res.send('This route is protected');
});

app.get('/logout', (req, res) => {
  res.clearCookie('session-token');
  res.redirect('/login');

});


function checkAuthenticated(req, res, next) {

  let token = req.cookies['session-token'];

  let user = {};
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    user.name = payload.name;
    user.email = payload.email;
    user.picture = payload.picture;
  }
  verify()
    .then(() => {
      req.user = user;
      next();
    })
    .catch(err => {
      res.redirect('/login');
    });

}

module.exports = {
  server: app,
  start: port => {
    if ( !port ) { throw new Error( 'Missing Port' ); }
    app.listen( port, () => console.log( `Listening on ${port}` ) );
  },
};



























// app.use('/api/v1', v1Routes);
// app.use('/api/v2', v2Routes);

app.use('*', notFoundHandler);
app.use(errorHandler);

module.exports = {
  server: app,
  start: port => {
    if (!port) { throw new Error('Missing Port'); }
    app.listen(port, () => console.log(`Listening on ${port}`));
  },
};

//////////////////////////////////////////////
