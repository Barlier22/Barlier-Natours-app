const AppError = require('../utility/appError');

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

const handleCantErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400); // we marke operational!
};

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `duplicate field value: ${value} please use an other value`;
  return new AppError(message, 400);
};

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

const handleValidationEroorDB = (err) => {
  const Erorrs = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data ${Erorrs.join('. ')}`;
  return new AppError(message, 400);
};

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/
const handleJWTError = (err) => {
  const message = `Invalid token. Please log in again`;
  return new AppError(message, 401);
};

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/
const handleJWTTokenExpiredError = (err) => {
  const message = `Your token has expired. please log in again.`;
  return new AppError(message, 401);
};

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      Error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'something went very wrong',
    msg: err.message,
  });
};

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

const sendErrorPro = (err, req, res) => {
  //   API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      /* if error is operational then send this respond to the client */
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    /*Programming or other unknown error message error to the client*/
    return res.status(500).json({
      status: 'error',
      message: 'something went very wrong',
    });
  }
  //
  // rendering error website
  if (err.isOperational) {
    /* if error is operational then send this respond to the client */
    return res.status(err.statusCode).render('error', {
      title: 'Something went very wrong',
      msg: err.message,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went very wrong',
    msg: 'Please try it again later',
  });
};

/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

/*  This is a global error middlware
   any kind of error that occured the error object will propagate 
  Antil here and will be handle here*/
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // if undefined statusCode=500
  err.status = err.status || `error`;
  /* Erros development vs production*/
  /*------------------------------------ */
  if (process.env.NODE_ENV === 'development;') {
    sendErrorDev(err, req, res);
  }
  /*------------------------------------ */

  if (process.env.NODE_ENV.trim() === 'production') {
    // --------> send meaningful errors to client by marking the tree types of Erros operational.
    //----> we marke the error as operational.
    //--> ERRORS COMMING FROM THE MOOGOSE LIBRAIRY
    let error = Object.assign(err); // make copy error object
    if (error.name == 'CastError') error = handleCantErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationEroorDB(error);

    //--> ERRORS  COMMING FROM JsonWebToken LIBRAIRY
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTTokenExpiredError(error);
    console.log(error.message);
    sendErrorPro(error, req, res);
  }

  next();
};
