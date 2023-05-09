const stripe = require('stripe')(
  `sk_test_51N3xLQC9roNfAMJyS0wZTxMv8ZL9Ial2jlJGf5wlolILYYPXMkrA75EWn52q4ZxxOC7mRBlCcYt72GUA9reYIFs5000CFA4LB2`
);
const Tour = require('../models/toursmodel');
const bookingModel = require('../models/bookingmodel');
const asyncCatch = require('../utility/asyncCatch');
const AppError = require('../utility/appError');
const factory = require('../controllers/handlerFactory');
const UserModel = require('../models/userModel');

exports.getCheckoutSession = asyncCatch(async (req, res, next) => {
  //--> get the current booked Tour
  const tour = await Tour.findById(req.params.tourId);

  //--> create checkout session
  //
  const session = await stripe.checkout.sessions.create({
    //--> information about a sesion itself
    mode: 'payment',
    payment_method_types: ['card'], // credit card as paymet
    success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`, //--> where to lead client once session is finished and it success

    // success_url: `${req.protocol}://${req.get('host')}/my-tours // this is real url once we deploy the appk
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, //where to lead client once hi cancel the session
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    //--> information about a product purchase
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,

          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ], // information About a product
  });

  //3) create a session as an response
  res.status(200).json({
    status: 'success',
    session,
  });
});
const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await UserModel.findOne({ email: session.customer_email })).id;
  const price = session.line_items[0].price_data.unit_amount / 100;
  await bookingModel.create({ tour, user, price });
};

exports.webhookCheckOut = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECREATE
    );
  } catch (error) {
    res.status(400).send(`webhook error: ${error.message}`);
  }
  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);
  res.status(200).json({ received: true });
};

// this function will be ignore/ comment out  once will diploy the appk
exports.createBookingCheckout = asyncCatch(async (req, res, next) => {
  // this is not secure at aall
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await bookingModel.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});
exports.createBooking = factory.createOne(bookingModel);
exports.getAllBooking = factory.getAll(bookingModel);
exports.getOneBooking = factory.getOne(bookingModel);
exports.deleteBooking = factory.deleteOne(bookingModel);
exports.updateBooking = factory.updateOne(bookingModel);
