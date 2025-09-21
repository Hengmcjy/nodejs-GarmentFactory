exports.get404 = (req, res, next) => {
  res.status(404).json({
    errMessage: "API Not Found Function 404",
    // isAuthenticated: req.session.isLogin
  });
};

exports.get500 = (req, res, next) => {
  // console.log('err 500-2');
  res.status(500).json({
    errMessage: "Error Occurred! 500...",
    // isAuthenticated: req.session.isLogin
  });
};

