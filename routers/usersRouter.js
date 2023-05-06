const express = require('express');
const authControler = require('../controllers/authController');
const userController = require('../controllers/userControler');
/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

const router = express.Router();
router.post('/signup', authControler.signup);
router.post('/login', authControler.login);
router.get('/logout', authControler.logOutUser);
router.post('/forgetPassword', authControler.forgotPassword);
router.patch('/resetPassword/:token', authControler.resetPassword);

/* only the log in user can perform the rest of the actions  */
router.use(authControler.protect);

router.patch('/updatePassword', authControler.updatePassword);
router.route('/me').get(userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uplaodUserPhoto,
  userController.resizeUserPhoto,
  userController.updteMe
);
router.delete('/deleteMe', userController.deleteMe);

/* only admin can  perform the rest of the actions */
router.use(authControler.restrictTO('admin'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
