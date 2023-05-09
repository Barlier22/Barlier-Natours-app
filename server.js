const mongoose = require('mongoose');

const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(`UNCAUGHTEXPTION Shutting down`);
  console.log(err.name, err.message);
  process.exit(1);
});

//-->  require the main app
const app = require('./app');

//--> Loads .env file contents into process.env. configuring confing.env file
dotenv.config({ path: './config.env' });

/* ---------------
  string connection
----------------*/
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
/* 
   mongooose.connect(strconnection , {}) return a promise which access to the connection objet
*/
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection succeful');
  });

// START THE  SERVER//
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});

/* 
  Sychronous handler error.
  so this is  global handler rejection promise.
  //--> Handled: Unhandled rejections  means there is a rejection promise some where an our code
process.on('unhandledRejection', (err) => {
} we are listening to the event emit when there is a rejection promise (unhandledRejection)
for extense: faild to login to db

s
*/

process.on('unhandledRejection', (err) => {
  console.log(`UNHANDLED REJECTIONS Shutting down`);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

//catching  uncatching Exceptions
/* 
    uncatching Exceptions are all errors or bugs that occurs in our 
    sychronous code but are not handler anywhere are called  uncatching Exceptions
*/

// process.on('uncaughtException', (err) => {
//   console.log(`UNCAUGHTEXPTION Shutting down`);
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
