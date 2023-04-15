//const flash = require('connect-flash');
// const { create } = require('../model/model');
const model = require('../model/model');
const flash = require('connect-flash');
const usermodel = require('../model/usermodel');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const nodemailer = require('nodemailer');

//cookie 
const cookie = require('cookie-parser');

//image path
const imagePath = path.join("uploads");
app.use("/uploads",express.static(path.join(__dirname,"uploads")));

// multer
const multer = require('multer');
const { log } = require('console');
const mystorage = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null,imagePath);  
    },
    filename : (req,file,cb) => {
        cb(null,file.fieldname+"-"+Date.now()); 
    }
})
const imageUpload = multer({ storage : mystorage}).single('avatar');



const home =  (req,res)=>{
    if(res.locals.user){
        req.flash('login_err', 'please first logout');
        return res.redirect('/dash');
    }
    return res.render('home');
}


const register =  (req,res)=>{
    if(res.locals.user){
        req.flash('login_err', 'please first logout');
        return res.redirect('/dash');
    }
    return res.render('register');
}
 
const login =  (req,res)=>{
    if(res.locals.user){
        req.flash('login_err', 'please first logout');
        return res.redirect('/dash');
    }
    return res.render('login');
}

const registerdata = async (req,res)=>{
    
    const {name,email,password,password2} = await req.body;
    let errors = [];

    //validation of data
    if(!name || !email || !password || !password2){
        errors.push({msg : 'please fill all details'});
    }
    if(password!=password2){
        errors.push({msg: 'password do not match'});
    }
    if(password.length<6){
        errors.push({msg: 'password should be atleast six character'});
    }
    if(errors.length > 0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        })
    }else{ 
        //validation passed
        model.findOne({email : email})
        .then(async(user)=>{
            try{
                if(user){
                    errors.push({msg : 'email already exist'});
                    res.render('register',{
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }
                else{
                    const user = await model.create({
                        name,
                        email,
                        password
                    });
                    req.flash('success_msg','you are registered now you can log in');
                    res.redirect('/login');
                }
            }catch(err){
                if(err){
                    console.log(err);
                    return false;
                }
            }             
        })
    }
}

const logindata = async (req, res) =>{
   await res.render('dash');
}

const dash =  (req, res) =>{

    if(!res.locals.user){
        return res.redirect('/login');
    }
    return res.render('dash');
 }

const logout = async (req, res, next) =>{
    try{
        await req.logout((err) => {
            if (err) {
              return next(err)
            }
            req.flash('success_msg', 'You have successfully logged out')
            res.redirect('/login')
          })
        
    }catch(err){
        if(err){
            console.log(err);
        }
    }
}

// form crud operation start
const form = (req,res) =>{
    return res.render('form');
}
const create = async (req, res) => {
    try {
      const data = await usermodel.create({
        grid: req.body.grid,
        name: req.body.name,
        email: req.body.email,
        pass: req.body.pass,
        phone: req.body.phone,
        course: req.body.course,
        fees: req.body.fees,
        avatar : imagePath+"/"+req.file.filename
       
      });
      console.log("data added");
      return res.redirect('back');
    }
    catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
}
const view = async (req,res)=>{
    try{
        const data =await usermodel.find({});
        return res.render('view',{
            alldata : data
        })
    }
    catch(err){
        if(err){
            console.log(err);
            return false
        }
    }
}
const deletedata = async (req,res)=>{
    try{
        let id = req.params.id;

        const data = await usermodel.findById(id);
        fs.unlinkSync(data.avatar);

        await usermodel.findByIdAndDelete(id);
        console.log("data delete");
        return res.redirect('back');
    }
    catch(err){
        if(err){
            console.log(err);
            return false
        }
    }
}
const editdata = async (req,res)=>{
    try{
        let id = req.params.id;

        const data = await usermodel.findById(id);
        return res.render('edit',{
            editdata : data
        });
    }
    catch(err){
        if(err){
            console.log(err);
            return false
        }
    }
}

const updatedata = async (req,res)=>{
    try{
        let id = req.body.id;

        if(req.file){
            const data = await usermodel.findById(id);
            fs.unlinkSync(data.avatar);

            await usermodel.findByIdAndUpdate(id,{
                grid: req.body.grid,
                name: req.body.name,
                email: req.body.email,
                pass: req.body.pass,
                phone: req.body.phone,
                course: req.body.course,
                fees: req.body.fees,
                avatar : imagePath+"/"+req.file.filename
            })
            return res.redirect('/view');
        }
        else{
           const data = await usermodel.findById(id);
           let oldimg = data.avatar;

           await usermodel.findByIdAndUpdate(id,{
            grid: req.body.grid,
            name: req.body.name,
            email: req.body.email,
            pass: req.body.pass,
            phone: req.body.phone,
            course: req.body.course,
            fees: req.body.fees,
            avatar :oldimg
           })
           return res.redirect('/view');
        }
       
    }
    catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
}
// form crud operation end

//forgot password

const forgot = (req,res) =>{

    return res.render('forgot');

}

const forgotpass = async(req,res) => {
    try{
         let email = req.body.email;
         let user = await model.findOne({email : email});
         if(user){
             let otp = Math.floor(Math.random() * 1000000);
 
             let transporter = nodemailer.createTransport({
                 host: 'smtp.gmail.com',
                 port: 587,
                 secure: false,
                 auth: {
                   user: 'arpitvadariya003@gmail.com',
                   pass: 'ioufebxriwioarjc'
                 }
               });
 
               let mailOptions = {
                 from: 'arpitvadariya003@gmail.com',
                 to: email,
                 subject: 'Rudra infotech Forgot password',
                 text: 'Otp :- '+otp
               };
 
               transporter.sendMail(mailOptions, function(error, info){
                 if(error) {
                   console.log(error);
                 } else {
                     let otpobj = {
                         email : email,
                         otp : otp
                     }
                     res.cookie('otp',otpobj);
                   console.log('Email sent: ' + info.response);
                   return res.redirect('/otp');
                 }
               });
         }else{
             console.log("User not found");
             return res.redirect('back');
         }
    }catch(err){
         console.log(err);
         return res.redirect('back');
    }
 }

const otp = (req,res) =>{
    return res.render('otp');
}

const otpdata = (req,res)=>{
    let otp = req.cookies.otp.otp;
    if(otp == req.body.otp){
        return res.redirect('/newpass');
    }
    else{
        console.log("otp not match");
        return res.redirect('back');
    }
}

const newpass = (req, res)=>{

    return res.render('newpass');

}

const newpassdata = async(req, res) =>{

try{

    if(req.body.password == req.body.cpassword){
        let email = req.cookies.otp.email;

        let data = await model.findOneAndUpdate({email},
            {
                password : req.body.password
            });

            if(data){
                console.log("password changed");
                res.clearCookie('otp');
                return res.redirect('/login');
            }
            else{
                console.log("password not match");
            }
    }
    else{
        console.log("please enter both password same");
        return res.redirect('back');
    }

}
catch(err){
    if(err){
        console.log(err);
        return false;
    }
}

}


module.exports = {
                    home,
                    forgot,
                    login,
                    registerdata,
                    logindata,
                    dash,
                    logout,
                    register,
                    form,
                    create,
                    view,
                    deletedata,
                    editdata,
                    updatedata,
                    forgotpass,
                    otp,
                    otpdata,
                    newpass,
                    newpassdata
                };