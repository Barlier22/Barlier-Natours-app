class APIfeatures {
  constructor(query, queryString) {
    this.query = query; //Tour.find()
    this.queryString = queryString; // req.quey
  }

  /*  public API */
  /* ---------------------
  
      ---------------------*/

  filter() {
    const queryObject = { ...this.queryString };
    const excludedFeilds = ['page', 'sort', 'limit', 'fields'];
    excludedFeilds.forEach((el) => delete queryObject[el]);

    let queryStr = JSON.stringify(queryObject); // convert obj to a string

    //-->remplace
    queryStr = queryStr.replace(
      /\b(gte| gt|lte| lt)\b/g,
      (match) => `$${match}`
    );

    // Tour.find.find
    this.query = this.query.find(JSON.parse(queryStr)); //Tour.find().find()
    return this;
  }
  /* ----------------------------------------------------------

    ---------------------------------------------------------*/

  sort() {
    if (this.queryString.sort) {
      //--> req.query
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy); //Tour.find().sort()
      //--> sort(price, ratingsAverage)
    } else {
      this.query = this.query.sort('-createAt'); //Tour.find().sort() exclude this field from the out put
    }
    return this;
  }
  /* --------------------------------------------------------
  
 
    ---------------------------------------------------------*/
  limitingFields() {
    if (this.queryString.fields) {
      const fieldsDocument = this.queryString.fields
        .trim()
        .split(',')
        .join(' ');
      this.query = this.query.select(fieldsDocument); // Tour.find().select()
    } else {
      this.query = this.query.select('-__v'); // we need to exclude this field from the ou pu
    }
    return this;
  }
  /* --------------------------------------------------------
  
    
    ---------------------------------------------------------*/
  pagination() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit; // page 3  saut 20 results et affiche 10 appartir de la
    this.query = this.query.skip(skip).limit(limit); //Tour.find().skip().limit
    //   if (this.queryString.page) {
    //     const numberOfDocument = await Tour.countDocuments();

    //     if (skip >= numberOfDocument)
    //       throw new Error(`this page doen't existe`);
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
    return this;
  }
}
module.exports = APIfeatures;
