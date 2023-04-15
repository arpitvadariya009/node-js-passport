const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1/block-project");


const db = mongoose.connection;

db.on('err',console.error.bind(console,"DB not connect"));

db.once('open',(err)=>{
    if(err){
        console.log(err);
        return false;
    }
    console.log("DB start");
})

module.exports = db;