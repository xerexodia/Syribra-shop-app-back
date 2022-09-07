const mongoose = require("mongoose");



const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    passwordHash:{
        type:String,
        required:true 
    },
    phone:{
        type:String,
       
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    street:{
        type:String,
        default:''
    },
    appartement:{
        type:String,
        default:''
    },
    zip:{
        type:String,
        default:''
    },
    city:{
        type:String,
        default:''
    },
    country:{
        type:String,
        default:''
    },
    
    
},
{timestamps:true});

UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
})
UserSchema.set('toJSON', {
    virtuals:true
})


exports.User = mongoose.model('User',UserSchema); 