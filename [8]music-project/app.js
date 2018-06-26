const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json());

app.use((err, req, res, next) => next());

app.use('/web', express.static(__dirname + '/client'));

require('./dialogflow')(app);

const server = app.listen(3000, function(){
    console.log("Express server has started on port 3000")
});