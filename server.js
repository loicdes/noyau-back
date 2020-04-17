let express = require('express')
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

let DOMINOS = require('./handlers/dominos');

const port = process.env.PORT || 5000;

app.use(function (req, res, next) {
    var allowedOrigins = ['http://localhost:4200', 'https://noyau.herokuapp.com'];
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
      // Website you wish to allow to connect
     res.setHeader('Access-Control-Allow-Origin', origin);
    }
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

  // Set to true if you need the website to include cookies in the requests sent
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();})
  .get('', async (req, res, next) => res.send(true));

io.on('connection', (socket) => {
    socket.on('DOMINOS-STARTED', (payload) => {
        DOMINOS.joinGame(payload, io);
    });
    socket.on('DOMINOS-TURN-OVER', (payload) => {
        DOMINOS.play(payload, io);
    });
    socket.on('DOMINOS-DISCONNECT', (payload) => {
        DOMINOS.disconnect(payload, io);
    });
});

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});