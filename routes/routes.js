const express = require('express');
const app = express();
const routes = express.Router();
const controller = require('../controller/controller');
const passport = require('passport');
const fs = require('fs');
const path = require('path');

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


//auth routes
routes.get('/',controller.home);
routes.get('/register',controller.register);
routes.get('/login',controller.login);
routes.post('/registerdata',controller.registerdata);
routes.post('/logindata', (req, res, next) =>{
    passport.authenticate('local',{
        failureRedirect: '/login',
        failureFlash: true
        
    })(req, res, next);
},controller.logindata);
routes.get('/dash',passport.setAuthentication,controller.dash);
routes.get('/logout',controller.logout);
 
// user data routes
routes.get('/form',controller.form);
routes.post('/createdata',imageUpload,controller.create);
routes.get('/view',controller.view);
routes.get('/deletedata/:id',controller.deletedata);
routes.get('/editdata/:id',controller.editdata);
routes.post('/updatedata',imageUpload,controller.updatedata);


// forgot password routes
routes.get('/forgot',controller.forgot);
routes.post('/forgotpass',controller.forgotpass);
routes.get('/otp',controller.otp);
routes.post('/otpdata',controller.otpdata);
routes.get('/newpass',controller.newpass);
routes.post('/newpassdata',controller.newpassdata);


module.exports =  routes;