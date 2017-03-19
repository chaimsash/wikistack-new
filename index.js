//npm modules
const express = require('express');
const bluebird = require('bluebird');
const morgan = require('morgan');
const path = require('path');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const AutoEscapeExtension = require("nunjucks-autoescape")(nunjucks);

//custom modules
const routes = require('./routes');
const userRoutes = require('./routes/users.js');
const models = require('./models');

//initialize
const app = express();
const env = nunjucks.configure('views', {
  noCache: true
});
env.addExtension('AutoEscapeExtension', new AutoEscapeExtension(env));

//app.uses
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.set('view engine', 'html');
app.engine('html', nunjucks.render);
app.get('/', function (req, res, next) {
  res.redirect('/wiki');
});
app.use('/wiki', routes);
app.use('/users', userRoutes);
app.use(express.static(__dirname + '/public'));
app.use(function (err, req, res, next) {
  res.render('error', {
    message: 'You got an error',
    status: err.status,
    stack: err.status
  });
});

//listening & errors
models.db.sync({})
  .then(function () {
    app.listen(4000, function () {
      console.log('Im on baby');
    });
  })
  .catch(console.error);
