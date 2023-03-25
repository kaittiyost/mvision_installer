const express = require('express')
const app = express()
const PORT = 3009
const path = require("path")

var fs = require('fs'); 

//-------------------------------------------------
const { spawn } = require('child_process');
const http = require('http');
const https = require('https');

const Socket= require('socket.io');

const options = {
  key: fs.readFileSync('certs/key.pem'),
  cert: fs.readFileSync('certs/cert.pem'),
};

let server = http.createServer(options,app).listen(PORT, function(){
    console.log("MVSION Pro Status [OK]\nOpen a browser to https://localhost:" + PORT+"/login");
});
  
var io = Socket(server);

//-------------------------------------------------

app.set('view engine','ejs')

let assetsDir = path.join(__dirname,"assets")
app.use('/assets',express.static(assetsDir))

app.use(express.urlencoded({ extended: true }))

io.on('connection', (socket) => {
  console.log('a user connected');
  var childProcess;
// receive dynamic data from client
  socket.on('dataCMD', (data) => {
    var dataFromClient = [];
    dataFromClient = data.cmd.split(" ");
    console.log(dataFromClient.slice(1)); // remove data array index 0 for arg
  
    var arg = dataFromClient.slice(1)
    childProcess = spawn(`${dataFromClient[0]}`, dataFromClient.slice(1));

    childProcess.stdout.on('data', (data) => {
      console.log(data.toString());
      socket.emit('output', data.toString());
    });
  });

  socket.on('killProcess', () => {
    console.log('user killProcess');
    childProcess.kill();
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    //childProcess.kill();
  });

})


app.use('/',require('./routes/home'))
app.use('/linux',require('./routes/linux'))
app.use('/windows',require('./routes/windows'))
app.use('/vmware',require('./routes/vmware'))
app.use('/isilon',require('./routes/isilon'))
app.use('/prometheus',require('./routes/prometheus'))
app.use('/influxdb',require('./routes/influxdb'))
app.use('/grafana',require('./routes/grafana'))
app.use('/docker',require('./routes/docker'))

