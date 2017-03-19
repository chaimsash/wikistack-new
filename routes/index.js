const router = require('express').Router();
const models = require('../models');

router.get('/', function (req, res, next) {
  models.Page.findAll()
    .then(function (pages) {
      res.render('index', {
        pages: pages
      });
    })
    .catch(next);
});

router.get('/add', function (req, res, next) {
  res.render('addpage');
});

router.get('/search', function (req, res, next){
  if (req.query.tag){
    res.redirect('/wiki/search/' + req.query.tag);
  } else { res.render('search'); }
});

router.get('/search/:tag', function (req, res, next){
  models.Page.findByTag(req.params.tag)
  .then(function (pages) {
    res.render('index', {
      pages: pages
    });
  });
});

router.get('/:urlTitle', function (req, res, next) {
  models.Page.findOne({
      where: {
        urlTitle: req.params.urlTitle
      },
      include: [{
        model: models.User,
        as: 'Author'
      }]
    })
    .then(function (page) {
      if (page === null) {
        next(res.status(404));
      } else {
        res.render('wikipage', {
          page: page
        });
      }
    })
    .catch(next);
});

router.get('/:urlTitle/similar', function (req, res, next) {
  models.Page.findOne({
      where: {
        urlTitle: req.params.urlTitle
      }
    })
    .then(function (page) {
      return page.findSimilar();
    })
    .then(function (similar) {
      res.render('index', {
        pages: similar
      });
    })
    .catch(next);
});

router.get('/:urlTitle/delete', function (req, res, next) {
  models.Page.findOne({
      where: {
        urlTitle: req.params.urlTitle
      }
    })
    .then(function (page) {
      return page.destroy();
    })
    .then(function () {
      res.redirect('/wiki');
    })
    .catch(next);
});

router.post('/', function (req, res, next) {
  models.User.findOrCreate({
      where: {
        name: req.body.name,
        email: req.body.email
      }
    })
    .then(function (user) {
      models.Page.create(req.body)
        .then(function (page) {
          var author = Number(user[0].id);
          return page.setAuthor(author)
            .then(function () {
              res.redirect('/wiki/' + page.urlTitle);
            });
        });
    })
    .catch(next);
});

router.get('/:urlTitle/edit', function (req, res, next) {
  models.Page.findOne({
      where: {
        urlTitle: req.params.urlTitle
      },
      include: [{
        model: models.User,
        as: 'Author'
      }]
    })
    .then(function (page) {
      res.render('editpage', {
        page: page
      });
    })
    .catch(next);
});

router.post('/:urlTitle', function (req, res, next) {
  models.Page.findOne({
      where: {
        urlTitle: req.params.urlTitle
      }
    })
    .then(function (page) {
      return page.update(req.body);
    })
    .then(function () {
      res.redirect(req.params.urlTitle);
    })
    .catch(next);
});

module.exports = router;
