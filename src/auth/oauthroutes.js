'use strict';

const express = require('express');

const cookieParser = require('cookie-parser');

const app = express();
const oauth = express.Router();
app.set('view engine', 'ejs');


app.use(express.json());


// Google Auth
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);


// Middleware

oauth.use(cookieParser());
oauth.use(express.static('public'));

oauth.get('/authPage', (req, res) => {
  res.render('authHome.ejs');
});

oauth.get('/login', (req, res) => {
  res.render('login');
});

oauth.post('/login', (req, res) => {
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

oauth.get('/profile', checkAuthenticated, (req, res) => {
  let user = req.user;
  //   res.send(req);
  //   res.send(user);
  res.render('profile', { user });
});

oauth.get('/protectedRoute', checkAuthenticated, (req, res) => {
  res.send('This route is protected');
});

oauth.get('/logout', (req, res) => {
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




module.exports = oauth;
