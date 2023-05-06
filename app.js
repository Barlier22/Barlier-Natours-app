const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const tourRouter = require('./routers/toursRouter');
const userRouter = require('./routers/usersRouter');
const reviewRouter = require('./routers/reviewRouter');
const viewsRouter = require('./routers/viewsRouter');
const bookingRouter = require('./routers/bookingRouter');
const AppError = require('./utility/appError');
const errorController = require('./controllers/errorController');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const app = express(); // (an app object is return)creation of app object with express

//--> set pug engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
/*----------------------------- --------------------------------

--------------------------------------------------------------*/
/* 
      GLOBAL MIDDLEWARE.

*/

// server static file.
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://*.cloudflare.com',
  'https://js.stripe.com/v3/',
  'https://checkout.stripe.com',
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://www.myfonts.com/fonts/radomir-tinkov/gilroy/*',
  'checkout.stripe.com',
];
const connectSrcUrls = [
  'https://*.mapbox.com/',
  'https://*.cloudflare.com',
  'http://127.0.0.1:3000/*',
  'ws://127.0.0.1:*/',
  'ws://127.0.0.1:*/',
  // 'https://bundle.js:*',
  '*.stripe.com',
];

const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ['*.stripe.com', '*.stripe.network'],
    },
  })
);
app.use(compression());
//--> development log in
if (process.env.NODE_ENV === 'development;') {
  app.use(morgan('dev')); // return request data in the console colored.
}

//--> limiting requests from the some API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: `Too many requets from this API , please try again in one hour`,
});
app.use('/api', limiter);

//--> Body Parser reading data in the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//--> Data sanitization againt NoSQL injection
app.use(mongoSanitize());

//--> Data sanitization against xss
app.use(xss());

//--> prevent parametter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
      'price',
    ],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

/*----------------------------- ---------------------------------------

---------------------------------------------------------------------*/

/* 
   ALL HANDLES ROUTERS.
*/
//--> router for template HTML
//--> route for render baseTemplate

app.use('/', viewsRouter);
/*----------------------------- ---------------------------------------

---------------------------------------------------------------------*/
//--> routers for API
/* ROUTERS  mountig routers (montage de routeurs)*/
app.use('/api/v1/tours', tourRouter); // for tour resource
app.use('/api/v1/users', userRouter); // for users resources
app.use('/api/v1/review', reviewRouter); // for users resources
app.use('/api/v1/bookings', bookingRouter); // for users resources

/*
 handling router that are not defined
 app.all('*') for all http verb get post delecte ...

 */
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // (err.status = 'fail'), (err.statusCode = 404),
  //-->
  /* l'idee est au lieu de cree our own error object
   we can create a classError so like that we move detail in to that file*/
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

/* GLOBAL ERROR HANDLING */
app.use(errorController); // we hidden detail into that errorController

module.exports = app;
