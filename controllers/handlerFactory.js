const asyncCatch = require('../utility/asyncCatch');
const AppError = require('../utility/appError');
const APIfeatures = require('../utility/apiFeatures');

/* ------------------------------------------

-------------------------------------------*/
exports.deleteOne = function (Model) {
  return asyncCatch(async (req, res, next) => {
    //--> find and delete doc
    const doc = await Model.findByIdAndDelete(req.params.id);

    //--> if undefined
    if (!doc) {
      return next(new AppError(`No document found for that ID`, 404));
    }

    //--> send response
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

/* ------------------------------------------

-------------------------------------------*/
exports.updateOne = (Model) => {
  return asyncCatch(async (req, res, next) => {
    // --> find and update
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }); // faire tourne tout les validateurs dans le model

    //--> if undefined
    if (!doc) {
      return next(new AppError(`No document found for that ID`, 404));
    }

    //--> send response
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};
/* ------------------------------------------

-------------------------------------------*/
exports.createOne = function (Model) {
  return asyncCatch(async (req, res, next) => {
    //--> create doc based on doc model
    const doc = await Model.create(req.body); // return a promise

    //--> send response
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};
/* ------------------------------------------

-------------------------------------------*/
exports.getOne = function (Model, populateoption) {
  return asyncCatch(async (req, res, next) => {
    //--> Query for the document
    let query;
    query = Model.findById(req.params.id); // return a query promise
    if (populateoption) query = query.populate(populateoption);
    doc = await query;

    //--> if undifined

    if (!doc) {
      return next(new AppError(`No document found for that ID`, 404));
    }

    //--> send response
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

exports.getAll = function (Model) {
  return asyncCatch(async (req, res, next) => {
    //--> so with AsynCatch we hidden detail about try{}.Catch block

    //-->  to allow nested get review on tour ()
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //--> QUERY THE dODUMENT
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitingFields()
      .pagination();

    //--> WE EXECUTE THE QUERY
    // const doc = await features.query.explain();
    const doc = await features.query;

    //---> WE SEND RESPONSES.
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
};
