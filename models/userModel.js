const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')   // built in node module

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please fill name"]
    },
    email:{
        type:String,
        required:[true,"please fill email"],
        unique:true,
        lowercase:true,   // converts to lowercase
        validate:[validator.isEmail, "please provide a valid email"]
    },
    photo:{
        type:String,
    },
    role: {
        type: String,
        enum : ['user','admin', 'guide', 'lead-guide'],
        default: 'user'
    },
    password:{
        type:String,
        required:[true,"please fill password"],
        minlength:8, 
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,"please fill password confirm"],
        validate:{
            validator:function(el) {
                return el === this.password
            },
            message:"passwords are not same"
        }
    },
    passwordChangedAt: {
        type:Date
    },
    passwordResetToken: String,
    passwordResetExpires:Date,
    active: {
        type:Boolean,
        default:true,
        select:false
    }
})

userSchema.pre('save' , async function(next){
    // only run fxn if passwords are modified
    if( !this.isModified('password')){return next()}

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()
})
userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt =Date.now() - 1000; // to ensure jwt always created after this
    next();
})

userSchema.pre(/^find/, function(next){
    // this points to current query(query middleware)
    this.find({active:{$ne:false}})
    next()
})
userSchema.methods.correctPassword = async function(candidatepassword, userpassword){
    return await bcrypt.compare(candidatepassword, userpassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
    if (this.passwordChangedAt){
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime()/1000,
            10
        )
        return JWTTimeStamp < changedTimeStamp
    }

    //false means not changed
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

    this.passwordResetExpires = Date.now() + 10*60*1000
    return resetToken
    // database mein encrypted rakh liya aur bande ko resettoken bhej diya (kind of temporary password)
}
const User = mongoose.model('User', userSchema)
module.exports = User