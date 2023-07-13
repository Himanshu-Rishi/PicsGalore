class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: { $regex: this.queryStr.keyword, $options: "i" },
        }
      : {};
      console.log(keyword);
    this.query = this.query.find({ ...keyword });
    return this;
  }
  filter()
  {
    const remove_fiels = ["keyword", "page", "limit"];
    const queryCopy = {...this.queryStr};
    remove_fiels.forEach((element)=>
    {
      delete queryCopy[element];
    })
    // adding filters

    let query_temp = JSON.stringify(queryCopy);
    query_temp = query_temp.replace(/\b(gt|gte|It|lte)\b/g, (key) => `$${key}`);
    this.query = this.query.find(JSON.parse(query_temp)) ;
    return this;
  }
  pagination(resultPerPage)
  {
    const current_page = Number(this.queryStr.page) || 1
    const skip = resultPerPage*(current_page-1);
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

module.exports = ApiFeatures;
