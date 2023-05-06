const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/
//--> we discribe our user what they need! IN schema
const userSchema = new mongoose.Schema({
  //-->field
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    unique: true,
  },

  //-->field
  email: {
    type: String,
    required: [true, 'Please Provide your Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid Email'],
  },

  //-->field
  photo: {
    type: String,
    default: 'default.jpg',
  },

  //-->field
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  }, // differente type of user's

  //-->field
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    maxlength: 8,
    select: false, //--> this field will not be avaible to the output
  },

  //-->field
  passwordConfirm: {
    type: String,
    required: [true, 'Please confrim your password'],
    validate: {
      // works only for CREATE and SAVE!
      validator: function (currentfield) {
        return currentfield === this.password;
      },
      message: 'Passwords are not the same',
    },
  },

  //-->fields
  passwordchangedAt: { type: Date },

  //-->fields
  passwordResetToken: String,

  //-->fields
  passwordResetExpired: Date,

  //-->fields
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

/*--------------------------------------------------------------
            for the sign up fonctionality
 -------------------------------------------------------------*/

/* cryptage of password we use mongoose middleware the pre-save middleware */
/*
  isModified(path?: string | string[] | undefined): boolean
  Returns true if any of the given paths is modified, else false.
*/
userSchema.pre('save', async function (next) {
  //--> if  false not modified
  // si password n'a pas ete modifier pass to next() middlware function
  if (!this.isModified('password')) return next();

  // sinon encrypt
  //--> we use an  algoritem call bcrypt in bcrypt package
  this.password = await bcrypt.hash(this.password, 12);

  //  remove  passwordConfirm from the out put
  this.passwordConfirm = undefined;
  next();
});
//-----------------
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordchangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

/*--------------------------------------------------------------
           An intance methode compared password for log in foction
 -------------------------------------------------------------*/

/*
   1) An instance method
   An instance methode is basically a method
   that gonna be avaible on all documents of certains collections.

   we use it to compare the given password of the client and the one is hash
   function compare(s: string, hash: string): Promise<boolean> (+1 overload)
*/
userSchema.methods.correctPassWord = async function (
  candidatePassWord,
  userPassword
) {
  //--> this= current object document
  return await bcrypt.compare(candidatePassWord, userPassword); // return true or false
  //--> this method is avaible for each document !
  //-->function compare(s: string, hash: string): Promise<boolean>
};

/*--------------------------------------------------------------
     An instance method for protect resouces
 -------------------------------------------------------------*/
userSchema.methods.changePassWordAfter = function (JWTTimesTamp) {
  if (this.passwordchangedAt) {
    const changedTimesTamp = parseInt(
      this.passwordchangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimesTamp, JWTTimesTamp);
    return JWTTimesTamp < changedTimesTamp;
  }

  return false;
};

/*--------------------------------------------------------------
  this = current object document in intance methode ! for the log in
 -------------------------------------------------------------*/
userSchema.methods.createPasswordReset = function () {
  // create the rendom token using crypto pakage.
  const resetToken = crypto.randomBytes(32).toString('hex');

  //--> we encrypted resettoken and put it in passwordResetToken in database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpired = Date.now() + 10 * 60 * 1000;
  //--> we retun the  reseToken that is not encrypted
  return resetToken;
};

//--> user document will be created thourght this model
const UserModel = mongoose.model('Users', userSchema);
module.exports = UserModel;
