const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('../../models/toursmodel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });
// console.log(process.env);
/* 
    string of connection
*/
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
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const review = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

/* 
  read Json File.
*/
const importData = async () => {
  try {
    await Tour.create(tour);
    // await User.create(user, { validateBeforeSave: false });
    // await Review.create(review);
    console.log('Data sucessfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// delecte all data from DB

const deletedata = async () => {
  try {
    await Tour.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();
    console.log('Data sucessfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
console.log(process.argv); // return un array the current path// the commande we are typed in console

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deletedata();
}
//node dev-data/data/import-dev-data.js --import
// node dev-data/data/import-dev-data.js --delete
