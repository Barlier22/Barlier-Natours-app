// const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/toursmodel');
const asyncCatch = require('../utility/asyncCatch');
const AppError = require('../utility/appError');
const factory = require('../controllers/handlerFactory');

/*----------------------------- --------------------------
  
  -----------------------------------------------------*/

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image ! Please Uploaded only  images', 400), false);
  }
};

// const uplaod = multer({ dest: 'public/img/users/' });
const uplaod = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = uplaod.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = asyncCatch(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();
  // imageCover
  const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFileName}`);
  req.body.imageCover = imageCoverFileName;

  //--
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );

  next();
});

/* 
   Aliasing 
   we pre-filed only our query string
  Pour 5 meilleur tour 
*/
//limit=5&sort=-ratingsAverage, price
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, ratingsAverage,summury, difficulty';
  next();
};

//--> GET all tour
exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = asyncCatch(async (req, res, next) => {
//   //--> so with AsynCatch we hidden detail about try{}.Catch block

//   //--> QUERY THE dODUMENT
//   const features = new APIfeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitingFields()
//     .pagination();

//   //--> WE EXECUTE THE QUERY
//   const tours = await features.query;

//   //---> WE SEND RESPONSES.
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });

//--> GET ONE TOUR
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = asyncCatch(async (req, res, next) => {
//   //--> Query for the document
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   //--> if undifned

//   if (!tour) {
//     return next(new AppError(`No tour found for that ID`, 404));
//   }

//   //--> send response
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

//--> CREATE ONE TOUR
exports.createNewTour = factory.createOne(Tour);
// exports.createNewTour = asyncCatch(async (req, res, next) => {
//   //--> create tour based on Tour model
//   const newTour = await Tour.create(req.body); // return a promise

//   //--> send response
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

//--> UPDATE ONE TOUR
exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = asyncCatch(async (req, res, next) => {
//   // --> find and update
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   //--> if undefined
//   if (!tour) {
//     return next(new AppError(`No tour found for that ID`, 404));
//   }

//   //--> send response
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

//--> DELETE TOUR
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = asyncCatch(async (req, res, next) => {
//   //--> find and delete tour
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   //--> if undefined
//   if (!tour) {
//     return next(new AppError(`No tour found for that ID`, 404));
//   }

//   //--> send response
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

/* 
  Aggregation Pipeline: matching and grouping
  using aggregation piplene is a bit like a regular 
  query but in aggregation we can manupilate the data
  even express given as aggregateTour.aggregate([ {stage},{stage}... ])
 return an aggregate object only we await
 so it can comes back with the results
*/
//--> statstic of our tour
exports.getTourStats = asyncCatch(async (req, res, next) => {
  const stats = await Tour.aggregate([
    //--> stage1
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      } /* filter by ratingsavarages. only the document that has ratingsAvarge >=5 will be 
        returned and passed to next stage  */,
    },

    //--> stage2
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // N.B EASY, MEDUIM,DIFFICULT
        // _id: { $toUpper: '$ratingsAverage' }, //
        /* 
            Pour chaque categorie des $difficulty ELMA par lequel on a grouper
            fait ce calculs en utilisant differente aggregation operation.
            fait ces calcules par difficulty( elma par lequel on groupe le docs).
        */

        numberOfTours: { $sum: 1 },
        numberOfRatings: { $sum: '$ratingsQuantity' }, //summe de trs par difficulte
        AvgOfRatings: { $avg: '$ratingsAverage' },
        AvgPrice: { $avg: '$price' }, // fait la moyenne de price par difficulty
        minPrice: { $min: '$price' }, //   fait la minimum de price par difficulty
        maxPrice: { $max: '$price' }, // fait le max de price par difficulty
      },
    },

    //--> stage3
    {
      $sort: { AvgPrice: 1 }, // sort le document! in ascending order -1 in descending order
    },
  ]);

  //--> send response
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });
});

//--> get mountly
exports.getMonthlyPlan = asyncCatch(async (req, res, next) => {
  const year = +req.params.year;
  // console.log(year);
  const Plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //$month operator return le mois
        numToursStart: { $sum: 1 }, // Nmber Tours
        tours: { $push: '$name' }, // $push operator return an arra containing the content of name
      },
    },
    {
      $addFields: { month: '$_id' }, // ajoute month:$_id
    },
  ]);

  //--> send response
  res.status(200).json({
    status: 'success',
    data: {
      Plan,
    },
  });
});
//  /tour-within/:distance/center/:latlng/unit/:unit,
// tour-distance/243/center/-11.625464, 27.513864/unit/mil

exports.getTourWithin = asyncCatch(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(`Please provide latitude and longitude in this formate`, 400)
    );
  }
  // console.log(distance, lat, lng, unit);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = asyncCatch(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(`Please provide latitude and longitude in this formate`, 400)
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});
