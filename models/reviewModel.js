const mongoose = require('mongoose');
const Tour = require('./toursmodel');
/*----------------------------- --------------------------
  
  -----------------------------------------------------*/
const reviewSchema = new mongoose.Schema(
  {
    //--> field
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },

    //--> field
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    //--> field
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    //--> field
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A Review must belong to a tour'],
    },

    //--> field
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
      required: [true, 'A Review must belong to a user'],
    },
  }, //--> end of schema
  //--> options? : for vitual proprieties
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

/*----------------------------- --------------------------
  before any find query
  -----------------------------------------------------*/

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // })
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

/*----------------------------- --------------------------
           we use a static method on review
  -----------------------------------------------------*/
reviewSchema.statics.calcAvargeRatings = async function (tourId) {
  // --> this point to the current model
  // we will use aggreation pipeline to make statics

  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    }, // retourne les documents qui corresponde seulement a ces tourId
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        AvgRatings: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0]?.nRatings,
    ratingsQuantity: stats[0]?.AvgRatings,
  });
  if (stats.length === 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
  }
};
/*----------------------------- --------------------------
  after any save in database
  -----------------------------------------------------*/
reviewSchema.post('save', function () {
  //--> this point to the current review  document.
  //--> this.constructor point to current model who created this.
  this.constructor.calcAvargeRatings(this.tour);
});
/*----------------------------- --------------------------
  
  -----------------------------------------------------*/
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   // const r= await this.findOne()
//   this.r = await this.findOne();
//   next();
// });
// reviewSchema.post(/^findOneAnd/, async function () {
//   await this.r.constructor.calcAvargeRatings(this.r.tour);
// });
/*----------------------------- --------------------------
  
  -----------------------------------------------------*/
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAvargeRatings(doc.tour);
});
const reviewModel = mongoose.model('Review', reviewSchema);
module.exports = reviewModel;
