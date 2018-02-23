const restify = require('restify');
const server = restify.createServer();
const data = require('./films.json');

server.use(
    function crossOrigin (req, res, next){
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      return next();
    }
  );

server.get('films', (req, res, next) => {
    res.json(data);
    next();
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});