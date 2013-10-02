exports.details = function(req, res) {
  res.render('signup', {
    email: req.user.email 
  });
}