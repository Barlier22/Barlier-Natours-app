const moongose = require('mongoose');

//---> booking schema
const bookingSchema = new moongose.Schema({
  tour: {
    type: moongose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour'],
  },
  user: {
    type: moongose.Schema.ObjectId,
    ref: 'Users',
    required: [true, 'Tour must belong to user'],
  },
  price: {
    type: Number,
    required: [true, 'Tour must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const bookingModel = moongose.model('Booking', bookingSchema);
module.exports = bookingModel;
