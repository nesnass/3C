var Contribution = require('./models.js').Contribution;

exports.setVettingFlagOnAll = function() {
  Contribution.find({}, function(err, foundset) {
    if (!err && foundset !== null) {
      foundset.forEach(function(c) {
        if (typeof c.vetted === 'undefined') {
          c.vetted = c.origin !== '3C';
          c.save();
        }
      })
    }
  })
};
