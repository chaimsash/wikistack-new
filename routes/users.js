const router = require('express').Router();
const models = require('../models');

router.get('/', function (req, res, next) {
  models.User.findAll()
    .then(function (users) {
      res.render('users', {
        users: users
      });
    });
});

router.get('/:name', function (req, res, next) {
  models.User.findOne({
      where: {
        name: req.params.name
      }
    })
    .then(function (user) {
      models.Page.findAll({
        where: {
          AuthorId: user.id
        }
      })
      .then(function(pages){
        res.render('index', {
          pages: pages,
          author: user.name
        });
      });

    });
});

module.exports = router;
