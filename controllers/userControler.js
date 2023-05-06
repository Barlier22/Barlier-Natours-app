const multer = require('multer');
const sharp = require('sharp');
const userModel = require('../models/userModel');
const asyncCatch = require('../utility/asyncCatch');
const AppError = require('../utility/appError');
const factory = require('../controllers/handlerFactory');
/*-------------------------------------------------- 
        files manager with multer!
 -------------------------------------------------*/
//  const multerStorage = multer.diskStorage({
//   //-> where to to store uplaoded files
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users/');
//   },
//   //-> the name of the files
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('Not an image ! Please Uploaded only  images', 400), false);
//   }
// };

//-->
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
//---> upload middleware
exports.uplaodUserPhoto = uplaod.single('photo');

//---> resizing middleware.
exports.resizeUserPhoto = asyncCatch(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
/*-------------------------------------------------- 
 -------------------------------------------------*/
const filterObj = (obj, ...allowedField) => {
  const newObj = {};
  Object.keys(obj).forEach((ElementKeys) => {
    if (allowedField.includes(ElementKeys)) {
      newObj[ElementKeys] = obj[ElementKeys];
    }
  });
  return newObj;
};
/*------------------------------------
 -----------------------------------*/
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

/*-------------------------------------------------------------- 
 
 -------------------------------------------------------------*/
exports.updteMe = asyncCatch(async (req, res, next) => {
  // console.log(req.file); // coming from multer middleware
  // console.log(req.body);

  //-->1 create error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        `this router is not for updating password! Please used /updatePassword `,
        400
      )
    );
  }

  //-->2 update user document

  /* 
      we the save method to update doments 
      await user.save() we don't use it because some fiels are required
      and we are not dealing with sensitive data  so we will use findByIdAndUpdate()*/
  const filterBy = filterObj(req.body, 'name', 'email');
  if (req.file) filterBy.photo = req.file.filename; // for uploading photo
  const updatedUser = await userModel.findByIdAndUpdate(req.user.id, filterBy, {
    new: true, // new : true we want the new document to be returned,
    runValidators: true, // we wante mongoose to validate our document
  });

  //--> send response

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

/*-------------------------------------------------------------- 
    
    -------------------------------------------------------------*/
exports.deleteMe = asyncCatch(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'sucess',
    data: null,
  });
});

/*-------------------------------------------------------------- 
    
    -------------------------------------------------------------*/
exports.getAllUsers = factory.getAll(userModel);
/*-------------------------------------------------------------- 
    
    -------------------------------------------------------------*/
exports.getUser = factory.getOne(userModel);
/*-------------------------------------------------------------- 
    
 -------------------------------------------------------------*/
exports.deleteUser = factory.deleteOne(userModel);
/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/
exports.updateUser = factory.updateOne(userModel);
/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This',
  });
};
