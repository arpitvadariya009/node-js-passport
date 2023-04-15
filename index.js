const express = require('express');
const path = require('path');
const port = 9000;
const app = express();
const db = require('./config/mongoose');
const fs = require('fs');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport');

//cookie
const cookie = require('cookie-parser');
const nodemailer = require('nodemailer');

//image path
const imagePath = path.join("uploads");
app.use("/uploads",express.static(path.join(__dirname,"uploads")));

// multer
const multer = require('multer');
const mystorage = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null,imagePath);  
    },
    filename : (req,file,cb) => {
        cb(null,file.fieldname+"-"+Date.now()); 
    }
})
const imageUpload = multer({ storage : mystorage}).single('avatar');

// view set up
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded());

//express session
app.use(session({
    secret: 'boom',
    resave: true,
    saveUninitialized: true,
    cookie : {
        maxAge : 1000*60*60
    }
  }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthentication);
app.use(cookie());

// connect flash
app.use(flash());

//global variables
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.login_err = req.flash('login_err');
    next();
})

//routes
app.use('/',require('./routes/routes'));


// server start
app.listen(port,(err)=>{
    if(err){
        console.log(err);
        return false;
    }
    console.log("server start on port "+ port);
})