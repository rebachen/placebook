exports.details = function(req, res) {
  res.render('account', {
    first_name: req.user.first_name 
  });
}