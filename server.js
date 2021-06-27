if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const fetch = require("node-fetch");
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const fs = require('fs');
const path = require('path');

const initializePassport = require('./passport-config');
const { Server } = require('http');
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []
let datas = {};
datas.table = [];

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: 'dadaaddadaa',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  fetch('https://api.coinbase.com/v2/prices/spot?currency=UAH')
  .then(function(resp){return resp.json()})
  .then(function(data){
  //console.log(data);
  let base = data.data.base;
  let amount = data.data.amount;
  let currency = data.data.currency;
  res.render('index.ejs',{ name: req.user.name, city: base, temp: amount, weather: currency})

})
.catch(function(){

});

  
  
})
app.post('/', checkAuthenticated, (req, res) => {
})
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const userjson = {
      name : req.body.name,
      email: req.body.email,
      password: req.body.password,
    };
    datas.table.push(userjson);
    fs.writeFile('users.json',JSON.stringify(datas), (err) => {
      if (err) {
        console.log('Error');
      }
    })
    users.push({
      id: Date.now().toString(),
      email: req.body.email,
      password: hashedPassword
      
    })
    console.log(users);
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}
 console.log('ok');
app.listen(3000)