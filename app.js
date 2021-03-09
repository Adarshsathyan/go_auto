var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars')
var adminRouter = require('./routes/admin');
var autoRouter = require('./routes/auto');
var userRouter = require('./routes/user');
var fileUpload = require("express-fileupload")
var db=require('./config/connection')
var session=require('express-session')
var app = express();
// const publicVapidKey='BEaWUyheW0dqWHMfHY-cTEQFxk3GUXycsUvQ3w03EZNeGFC3rx8aLAmrEeK6yCz5RIZgERz1viaUDivAIO9MbUI';
// const privateVapidKey='KPRS6a4w6mOGFRLmcpITp0MECc5jTFtKHQdQmhYmcN8';
// const webPush = require('web-push')


// // //web-push
// webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);



// view engine setup
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
}); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layouts/',partialDir:__dirname+'/views/partials/'}));
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload())
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"key",cookie:{maxAge:6000000}}));
db.connect((err)=>{
  if(err) console.log('Database not connected'+err);
  else console.log("Database Connected to port 27017");
})

app.use('/admin', adminRouter);
app.use('/auto', autoRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
