export const hiddenAlert = () => {
  const element = document.querySelector('.alert');
  if (element) element.parentElement.removeChild(element);
};
export const showAlert = (type, message) => {
  hiddenAlert();
  console.log('ok it workes');
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  console.log(markup);
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hiddenAlert, 5000);
};
