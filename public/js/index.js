import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logOutUser } from './login';
import { updatedUserData } from './updateSettings';
import { bookTour } from './stripe';
/*--------------------------------------
------------------------- */
const mapBox = document.getElementById('map');
const form = document.querySelector('.form--login');
const logout = document.querySelector('.nav__el--logout');
const userData = document.querySelector('.form-user-data');
const userPassWordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');

/*--------------------------------------
------------------------- */
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.location);
  displayMap(locations);
}
/*--------------------------------------
------------------------- */

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
/*--------------------------------------
------------------------- */
if (logout)
  logout.addEventListener('click', function (e) {
    if (!e.target.includes('nav__el--logout')) return;
    logOutUser();
  });
/*--------------------------------------

------------------------- */
if (userData)
  userData.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // console.log(form);
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    updatedUserData(form, 'data');
  });

/*--------------------------------------
------------------------- */
if (userPassWordForm) {
  userPassWordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updatedUserData(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

//--->
if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.dataset.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
