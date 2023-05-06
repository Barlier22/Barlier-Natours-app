module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(
      next
    ); /* // if there is a rejected promise or an error 
    in the fn function so catch it and passed in the next function*/
  };
};
/* this function return a function */
