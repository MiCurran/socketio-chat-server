var app = require('express')();
var http = require('http').createServer(app);
const PORT = process.env.PORT || 8080;
var io = require('socket.io')(http);
var cors = require('cors')
var bodyParser = require('body-parser')
//chat channel list
var STATIC_CHANNELS = [{
    name: 'Global chat',
    participants: 0,
    id: 1,
    sockets: []
}, {
    name: 'Typescript',
    participants: 0,
    id: 2,
    sockets: []
},
{
    name: 'JavaScript',
    participants: 0,
    id: 3,
    sockets: []
}];

//allows for cross origin req, res
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers","*")
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})


http.listen(PORT, () => {
    console.log(`listening on port:${PORT}`);
});

io.on('connection', (socket) => { // socket object may be used to send specific messages to the new connected client
    console.log('new client connected');//log when a new client connects to server socket
    socket.emit('connection', null);
    socket.on('channel-join', id => { 
        console.log('channel join', id); //on join channel log the joined channel
        STATIC_CHANNELS.forEach(c => {
            if (c.id === id) { 
                if (c.sockets.indexOf(socket.id) == (-1)) {
                    c.sockets.push(socket.id);
                    c.participants++;
                    io.emit('channel', c);
                }
            } else {
                let index = c.sockets.indexOf(socket.id);
                if (index != (-1)) {
                    c.sockets.splice(index, 1);
                    c.participants--;
                    io.emit('channel', c);
                }
            }
        });

        return id;
    });
    socket.on('send-message', message => {
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        STATIC_CHANNELS.forEach(c => {
            let index = c.sockets.indexOf(socket.id);
            if (index != (-1)) {
                c.sockets.splice(index, 1);
                c.participants--; //remove the participant from the channel
                io.emit('channel', c);
            }
        });
    });

});



/**
 * @description This method retirves the static channels
 */
app.get('/getChannels', (req, res) => {
    res.json({
        channels: STATIC_CHANNELS
    })
});

app.post('/addChannel',(req, res) =>{
    console.log('POST')
    var body = ''
    req.on('data', function(data) {
      body += data
    })
    req.on('end', function() {
      console.log(body)
      var data = JSON.parse(body)
      console.log(data.data.exampleRequired)
      function last(){
          return STATIC_CHANNELS[STATIC_CHANNELS.length - 1].id + 1
      }
      id = last()
      STATIC_CHANNELS.push({name:data.data.exampleRequired, participants:0, id:id, sockets:[]})
      console.log(STATIC_CHANNELS)
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.end('post received')
    })
 
})
