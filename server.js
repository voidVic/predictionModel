var app = require('./app');

app.set('port',process.env.PORT || 7898);

app.listen(app.get('port') , function() {
    console.log('Prediction Engine Listening on Port, port=%s' , app.get('port'));
});