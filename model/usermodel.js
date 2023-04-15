const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    grid : {
        type : String,
        required : true,
    },
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
    },
    pass : {
        type : String,
        required : true,
    },
    phone : {
        type : String,
        required : true,
    },
    course : {
        type : Array,
        required : true,
    },
    fees : {
        type : String,
        required : true,
    },
    avatar : {
        type : String,
        required : true,
    }
});
const admin = mongoose.model('userdata',adminSchema);
module.exports = admin;

