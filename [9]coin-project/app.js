const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

app.use((err, req, res, next) => next());

require('./api')(app);
require('./clova')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

const server = app.listen(3000, function(){
    console.log("Express server has started on port 3000")
});