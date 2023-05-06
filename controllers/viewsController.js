const Tour = require('../models/toursmodel');
const userModel = require('../models/userModel');
const bookingModel = require('../models/bookingmodel');
const asyncCatch = require('../utility/asyncCatch');
const AppError = require('../utility/appError');
const { response } = require('../app');

exports.getOverview = asyncCatch(async (req, res) => {
  //-->1 get  tour Data from the  Collection
  const tours = await Tour.find();
  //-->2 building a template.
  //--> 3. render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = asyncCatch(async (req, res, next) => {
  //--> 1 Get tour Data from the collection
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is not tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});
exports.getLoginForm = async (req, res) => {
  res.status(200).render('login', {
    title: 'log into your account ',
  });
};
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updsteUserData = async (req, res, next) => {
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
};

exports.getMyTours = async (req, res, next) => {
  const bookings = await bookingModel.find({ user: req.user.id });
  const tourIds = bookings.map((el) => {
    return el.tour;
  });
  // console.log(tourIds);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  // console.log(tours);
  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
};
