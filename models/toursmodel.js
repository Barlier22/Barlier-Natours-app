const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const UserModel = require('./userModel');

/* 
    MOOGOOSE SCHEMA and model.
    new mongoose.Schema({ schema definitions(describe)},{schema options})
*/
// describing data in our schema
const tourShema = new mongoose.Schema(
  {
    //--> field
    name: {
      type: String,
      required: [true, ' A tour must have a name'], //  buit in validator
      unique: true,
      trim: true,
      /* this validator only  avaible for string */
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      /* we can use library  validator*/
      validate: {
        validator: function (val) {
          return validator.isAlpha(val.split(' ').join('')); // return true or false
        },
        message: 'Tour name must only have characters',
      },
    }, //this objet is schema type options

    //-->field
    slug: String,

    //-->field
    duration: {
      type: Number,
      require: [true, 'A tour must have a duration'],
    },

    //-->field
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },

    //-->field
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      /* buit in validator  */
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, meduim, difficulty ',
      },
    },

    //-->field
    ratingsAverage: {
      type: Number,
      default: 4.5,
      /*  buit in validator */
      min: [1, 'Rating must be Above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //4.6666=4.7
    }, //Number,

    //-->field
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    //-->field
    price: {
      type: Number,
      required: [true, 'A tours must have a price'],
    },

    //-->field
    /* 
      custommer validator
      custommer validator is function which return 
       true or false if it false the message error will be display
    */

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // val=priceDiscount
          // this only point to current New document creaction not to update
          return val < this.price;
        },
        message: 'Discount price should be below regular price',
      },
    },

    //-->field
    summary: {
      type: String,
      trim: true,
    },

    //--> field
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summury'],
    },

    //-->field
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },

    //-->field
    images: [String],

    //-->field
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    //-->field
    startDates: [Date],

    //--> field
    secretTour: {
      type: Boolean,
      default: false,
    },

    //--> field geospatial data
    startLocation: {
      // GeoJson , type:{}, coordinate:{} in order to be recognize as a geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    }, // here we describe a geospatial data
    /*  [{}] in order to embaded the document we need simply specied an array of obj [{}] */
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ], // we embedded the geo data in tour model
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
      },
    ],
  },
  //--> end of schema

  //--> options?
  {
    toJSON: {
      virtuals: true,
    } /*  when the data is output as json we want the virtual to be part of that */,
    toObject: {
      virtuals: true,
    } /*  when the data is output as an Object we want the virtual to be part of that */,
  }
);
/*----------------------------- --------------------------
           Indexes
  -----------------------------------------------------*/

tourShema.index({ price: 1, ratingsAverage: -1 });
tourShema.index({ slug: 1 });
tourShema.index({ StartLocation: '2dsphere' });

/*----------------------------- --------------------------
        virtual properties
  -----------------------------------------------------*/
/*  virtual propertie we do : Schema.virtual('name of propertie').get(fn)*/
tourShema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//--> virtual propreties.
tourShema.virtual('reviews', {
  ref: 'Review', // colection reference
  foreignField: 'tour', // tour field it where the reference of this model(tour(Id)) is stored in a Review collection
  localField: '_id', // where these Ids are store in tour model
});
/*----------------------------- --------------------------
           mongoose middleware
  -----------------------------------------------------*/

/* 
   Schema.pre('event', function () {})
     1) Document middleware : runs before .save() and create() commend 
     N.b : c'est avec ces methodes (save, or create) que nous creons les documents dans la database
     the event save here is hooks 
*/
// pre- save hooks or pre-save middlware.
tourShema.pre('save', function (next) {
  //-->this = current object document that will  be saved in database.
  // it  call document middlware because it give us access to that document.
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* post middleware */
tourShema.post('save', function (doc, next) {
  // console.log(doc);
  //--> we have access to the document saved in database
  next();
});
/*----------------------------- --------------------------
  
  -----------------------------------------------------*/
// //--> Embadded user in Tour
// tourShema.pre('save', async function (next) {
//   const guidePromise = this.guides.map(async function (element) {
//     return await UserModel.findById(element);
//   });
//   this.guides = await Promise.all(guidePromise);
//   next();
// });

/*----------------------------- --------------------------
  
  -----------------------------------------------------*/
/* 

  2) QUERY MIDDLWARE.
query middleware : it a function that runs before or after a certain query is executed
pre-find hooks.THE HOOKS 'find' which make it quey middlware not document middleware so we 
have acess to query Object this=query object
/^find/ means for any thing start with find, so it a regular expression
*/

//runs before any query

tourShema.pre(/^find/, function (next) {
  // this key works point to the current query this=curreent query object
  this.find({ secretTour: { $ne: true } });

  next();
});
/*----------------------------- --------------------------
  
  -----------------------------------------------------*/

tourShema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides', // where is stored ids in child referencing to get out.
    select: '-__v -passwordchangedAt', //
  });
  next();
});

//runs after any query

tourShema.post(/^find/, function (docs, next) {
  // console.log(docs); // document deja find
  next();
});

/* 
   AGGREGATION MIDDLWARE 
   allows us to add hooks before or after an aggregation append
*/

// tourShema.pre('aggregate', function (next) {
//   // this= current aggregate option
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline()); // return the array object que nous avons specifie dans aggregate method
//   next();
// });

//--> creating tour model appartir de notre schema mongoose.model('name of model', schema)
//--> tour document will be created throught that model
const Tour = mongoose.model('Tour', tourShema);

module.exports = Tour;
