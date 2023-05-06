const userModel = require('../models/userModel');
const asyncCatch = require('../utility/asyncCatch');
const jwt = require('jsonwebtoken');
const AppError = require('../utility/appError');
const Email = require('../utility/email');
const { json } = require('express');
const { promisify } = require('util');
const crypto = require('crypto');
/*-------------------------------------------------------------- 
 -------------------------------------------------------------*/

//
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/
const createSendToken = function (user, statusCode, res) {
  const token = signToken(user._id);
  // remove password from the output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'sucess',
    token,
    data: {
      user,
    },
  });
};
/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

const createCookies = function (res, token) {
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };
  if (process.env.NODE_ENV.trim() === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
};
/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/
exports.getAllusers = async function (req, res) {
  //--> find a user
  const user = await userModel.find();
  res.status(200).json({
    status: 'success',
    results: user.length,
    data: {
      user,
    },
  });
};
/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

exports.signup = asyncCatch(async (req, res, next) => {
  //--> create new user
  const newUser = await userModel.create({
    role: req.body.role,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordchangedAt: req.body.passwordchangedAt,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  new Email(newUser, url).sendWelcome();

  //--> create a token
  //-->jwt.sign(payload: string | object | Buffer, secretOrPrivateKey: jwt.Secret, options?:

  const token = signToken(newUser._id); //
  // //  jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  // //   expiresIn: process.env.JWT_EXPIRES_IN,
  // // });
  createCookies(res, token);
  // //--> send a response and token to the user!
  // remove password from the output
  newUser.password = undefined;
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
  //-->
  // createSendToken(newUser, 201, res);
});

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

exports.login = asyncCatch(async (req, res, next) => {
  const { email, password } = req.body;

  //-- undefined cree cette error
  //--> check if email and password exist! create this error
  if (!email || !password) {
    return next(new AppError(`Please provide a valid email and password`, 400));
  }

  //--> check if user exist and password is correct.
  const user = await userModel.findOne({ email }).select('+password'); //--> explicity select password
  const correct = await user?.correctPassWord(password, user.password); // return true or false

  //--> if undefined  create this error
  if (!user || !correct) {
    return next(new AppError(`Incorrect Email or Password`, 401));
  }

  //--> check if evrything is ok send token to client
  const token = signToken(user._id);
  createCookies(res, token);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
  // createSendToken(user, 200, res);
});

exports.logOutUser = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

exports.protect = asyncCatch(async (req, res, next) => {
  //--> 1) getting token and check of it's there ! the token coming from the cookies
  /*
    The standard we write in postanmant authorization:'Bearer token, we get the token comming to the 
    req.headers.authorization: req.headers is an object 
    {
       authorization:'Bearer token',
     } 
    
  */
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //--> undifined
  if (!token) {
    return next(
      new AppError(
        `Your are not log in Please! Please go log in to get access`,
        401
      )
    );
  }

  //2) Verification of token
  // we use verify fonction in jsonwebtoken pakage jwt.verify(token: string, secretOrPublicKey: jwt.Secret, options?
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // deconded sera un object {id: id} id est {} qui a etais donnee comme pyload pour creer le token
  // 3) check if user still exists
  const currentUser = await userModel.findById(decoded.id);
  // if currentUser undefined then create this error !
  if (!currentUser) {
    return next(
      new AppError(`The user beloging to this token does no longer exist.`, 401)
    );
  }
  // checkin if user changed password after user issued
  if (currentUser.changePassWordAfter(decoded.iat)) {
    return next(
      new AppError(`User recently changed password! Please log in again !`)
    );
  }

  // grant access to protected route
  req.user = currentUser; // pass data to the next middlware
  res.locals.user = currentUser;

  next();
});

//
exports.isLogedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const token = req.cookies.jwt;

      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      const currentUser = await userModel.findById(decoded.id);
      // if currentUser undefined then ...
      if (!currentUser) {
        return next();
      }
      // checkin if user changed password after user issued
      if (currentUser.changePassWordAfter(decoded.iat)) {
        return next();
      }
      // there is A logged in user
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

exports.restrictTO = (...roles) => {
  return asyncCatch(async (req, res, next) => {
    // if false    req.user commes frem prevous middleware.
    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          `You have not permission permission to perform this action`,
          403
        )
      );
    }
    next();
  });
};

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

exports.forgotPassword = async (req, res, next) => {
  //--> getting user based in the email
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  // if undefined, pas user create this error
  if (!user) {
    next(new AppError(`There is no user with this email adress`, 404));
  }

  //--> generate unique  random  resettoken for the current user
  const resetToken = user.createPasswordReset();
  // console.log(resetToken);
  await user.save({ validateBeforeSave: false }); //  save the current fields in instance method
  try {
    //--> create the url link
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    //--> create message
    await new Email(user, resetUrl).sendResetToken();

    //--> sending response to the client
    res.status(200).json({
      status: 'success',
      message: `Token send to email `,
    });
  } catch (error) {
    // if error make those fields undefined
    // revove those fields from the out put
    (user.passwordResetToken = undefined),
      (user.passwordResetExpired = undefined);
    user.save({ validateBeforeSave: false }); //save
    // and this this error
    next(
      new AppError(
        `There was an error sending the email! please try again later`
      ),
      500
    );
  }
};

/*-------------------------------------------------------------- 
      //--> resetPassword
 -------------------------------------------------------------*/
exports.resetPassword = asyncCatch(async (req, res, next) => {
  //-->1 get user based on the token
  /*we need crypte the token in order to compare it with the one in the database*/

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //
  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpired: { $gt: Date.now() },
  });

  //-->2 if the token not expired , there user and  set new password.
  if (!user) {
    return next(new AppError(`token is invalid or expired`, 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpired = undefined;
  await user.save();
  //-->log the user in and send the jwt
  const token = signToken(user._id);
  createCookies(res, token);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = asyncCatch(async (req, res, next) => {
  //1) getting the user from the collection
  // const { passwordCurrent } = req.body.passwordCurrent;
  const user = await userModel.findById(req.user.id).select('+password');

  //2) check if password is correct.
  if (!(await user.correctPassWord(req.body.passwordCurrent, user.password))) {
    return next(new AppError(`Incorrect Password`, 401));
  }
  //3) if so update password.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();

  //4) Log user in and send jwt
  const token = signToken(user._id);
  createCookies(res, token);
  res.status(200).json({
    status: 'success',
    token,
  });
});
