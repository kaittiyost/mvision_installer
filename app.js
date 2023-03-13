const express = require('express')
//const app = express()
const port = 3000
const path = require("path")
var fs = require('fs'); 

const { networkInterfaces } = require('os');
const nets = networkInterfaces();

const subProcess = require('child_process')

//-------------------------------------------------
const { spawn } = require('child_process');
const http = require('http');
const Socket= require('socket.io');

const app = express();
let jsonPromData = require('./prometheus/prometheus.json'); 
var server = http.createServer(app).listen(3000, function(){
  console.log("Express server listening on port " + 3000);
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


app.get('/',(req,res) => {
  const results = Object.create(null);
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
  }
  //console.log(results);
  res.render('pages/index')
})
app.get('/linux',(req,res) => {
  var inventory = fs.readFileSync('resources/inventory/linux_host.ini','utf8'); 
  console.log(inventory);
  res.render('pages/linuxConfig',{
    inventoryRead:inventory
  })
})
app.get('/windows',(req,res) => {
  res.render('pages/windowsConfig')
})
app.get('/prometheus',(req,res) => {
  res.render('pages/prometheusConfig')
})
app.get('/LinuxConfig/ReadFile',(req,res) => {
  var inventory = fs.readFileSync('resources/inventory/linux_host.json','utf8'); 
  //console.log(inventory);
  let data ;
  if(inventory == ""){
    data = 'empty';
  }else{
    data = inventory;
  }
  res.status(200).send(data);
})
app.get('/WindowsConfig/ReadFile',(req,res) => {
  var inventory = fs.readFileSync('resources/inventory/windows_host.json','utf8'); 
  //console.log(inventory);
  let data ;
  if(inventory == ""){
    data = 'empty';
  }else{
    data = inventory;
  }
  res.status(200).send(data);
})
app.get('/PrometheusConfig/ReadFileYML',(req,res) => {
  var inventory = fs.readFileSync('prometheus/prometheus.yml','utf8'); 
  console.log(inventory);
  let data ;
  if(inventory == ""){
    data = 'empty';
  }else{
    data = inventory;
  }
  res.status(200).send(data);
})
app.get('/PrometheusConfig/ReadFile',(req,res) => {
  var inventory = fs.readFileSync('prometheus/prometheus.json','utf8'); 
  //console.log(inventory);
  let data ;
  if(inventory == ""){
    data = 'empty';
  }else{
    data = inventory;
  }
  res.status(200).send(data);
})
app.post('/PrometheusConfig/ReadFileByName',(req,res) => {
  const job_index = req.body.job_index;
  var inventory = fs.readFileSync('prometheus/prometheus.json','utf8'); 
  let targets_json = JSON.parse(inventory); 
  //console.log(job_index);
  //console.log(targets_json);
  //console.log(targets_json.collector[job_index]);
  
  let data ;
  if(inventory == ""){
    data = 'empty';
  }else{
    data = targets_json.collector[job_index];
  }
  res.status(200).send(data);
})
app.post('/LinuxConfig/SaveFile',(req,res) => {
  try {
    if(req.body.text === undefined){
      fs.writeFile(__dirname+'/resources/inventory/linux_host.json',"", function (err) {
        if (err) throw err;
        console.log('Host json has been saved!');
      });
    
      fs.writeFile(__dirname+'/resources/inventory/linux_host.ini', "[linux] \n", function (err) {
        if (err) throw err;
        console.log('File has been saved!');
        res.status(200).send('ok');
      });
    }else{
      fs.writeFile(__dirname+'/resources/inventory/linux_host.json',JSON.stringify(req.body.text_json), function (err) {
        if (err) throw err;
        console.log('Host json has been saved!');
      });
    
      fs.writeFile(__dirname+'/resources/inventory/linux_host.ini', req.body.text, function (err) {
        if (err) throw err;
        console.log('File has been saved!');
        res.status(200).send('ok');
      });
    }

  } catch (error) {
    console.log(error);
  }
})

app.post('/WindowsConfig/SaveFile',(req,res) => {
  try {
    fs.writeFile(__dirname+'/resources/inventory/windows_host.json',JSON.stringify(req.body.text_json), function (err) {
      if (err) throw err;
      console.log('Host json has been saved!');
    });
    let sumtext = req.body.text +
    ` [win:vars]
      ansible_connection=winrm
      ansible_port=5985
      ansible_winrm_server_cert_validation=ignore
      ansible_winrm_scheme=http
      ansible_winrm_transport=basic
      ansible_winrm_kerberos_delegation=true`;

    fs.writeFile(__dirname+'/resources/inventory/windows_host.ini', sumtext, function (err) {
      if (err) throw err;
      console.log('File has been saved!');
      res.status(200).send('ok');
    });
  } catch (error) {
    console.log(error);
  }
})

app.post('/PrometheusConfig/SaveFile',(req,res) => {
  let new_job = req.body.text 
  let new_job_obj = req.body.text_obj
  console.log(jsonPromData);
  console.log(new_job_obj);
  // try {
  //   fs.writeFile(__dirname+'/resources/inventory/windows_host.json',JSON.stringify(req.body.text_json), function (err) {
  //     if (err) throw err;
  //     console.log('Host json has been saved!');
  //   });
  //   let sumtext = req.body.text 
  //   fs.writeFile(__dirname+'/resources/inventory/windows_host.ini', sumtext, function (err) {
  //     if (err) throw err;
  //     console.log('File has been saved!');
  //     res.status(200).send('ok');
  //   });
  // } catch (error) {
  //   console.log(error);
  // }

  fs.appendFile(__dirname+'/prometheus/prometheus.yml', new_job , function (err) {
    if (err) throw err;
    console.log('New text appended to file Prom.yml!');
  });
})

app.get('/PingLinuxNode',(req,res) => {
  const cmd = `
  ansible linux -m ping -i $(pwd)/resources/inventory/linux_host.ini \
  `;
  var response;
    subProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        res.status(500).send(stderr);
      } else {
        response = stdout
        console.log(response);
        res.status(200).send(response);
      }
    })
})

app.get('/PingWindowsNode',(req,res) => {
  const cmd = `
  ansible -m win_ping win -i $(pwd)/resources/inventory/windows_host.ini;
  `;
  var response;
  subProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        res.status(500).send(stderr);
      } else {
        response = stdout
        console.log(response);
        res.status(200).send(response);
      }
    })

})

app.get('/InstallNodeExporter',(req,res) => {
  //ansible linux -m ping -i $(pwd)/resources/inventory/linux_host.ini
  //ansible-playbook  $(pwd)/resources/playbook/install-node-exporter.yml -i $(pwd)/resources/inventory/linux_host.ini
  const cmd = `
  cat $(pwd)/resources/inventory/linux_host.ini; \
   \
  `;
  var response;
  subProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        res.status(500).send(stderr);
      } else {
        response = stdout
        console.log(response);
        res.status(200).send(response);
      }
    })

})

app.get('/InstallWindowsExporter',(req,res) => {
  const cmd = `
  cat $(pwd)/resources/inventory/windows_host.ini; \
  ansible -m win_ping win -i $(pwd)/resources/inventory/windows_host.ini; \
  `;
  var response;
  subProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        res.status(500).send(stderr);
      } else {
        response = stdout
        console.log(response);
        res.status(200).send(response);
      }
    })

})


app.post('/CurlExporter',(req,res) => {

  const ipaddress = req.body.ipaddr;
  const os_type = req.body.os_type;
  let port = 9100;
  if(os_type =='windows'){
    port = 9182;
  }
  const cmd = `
  curl http://${ipaddress}:${port}/metrics \
  `;
  var response;
  subProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        res.status(500).send(stderr);
      } else {
        response = stdout
        console.log(response);
        res.status(200).send(response);
      }
    })
})

app.post('/DockerRestart',(req,res) => {
  const container_name = req.body.container_name;
  const cmd = `
  docker restart ${container_name}
  `;
  var response;
    subProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        res.status(500).send(stderr);
      } else {
        response = stdout
        console.log(response);
        res.status(200).send(response);
      }
    })
})

app.get('/login',(req,res) => {
    const cmd = "curl -k -X POST -H 'Accept:application/json' --basic -u intern@vsphere.local:1qaz2wsx#EDC \
    https://10.4.160.50/rest/com/vmware/cis/session";

    var response;
    subProcess.exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error(err)
          process.exit(1)
        } else {
          response = JSON.parse(stdout.toString())
          console.log(response.value);
          token = response.value
          req.session.loggedin = true;
          req.session.token = response.value;
        }
      })

    res.render('pages/index')
})

app.get('/vm',(req,res) => {
    console.log("++++++++++ "+req.session.token);
var cmd = "curl -k -X  GET -H 'Accept:application/json' 'https://vcsa.sys2.local/rest/vcenter/vm' -H 'vmware-api-session-id: c8f2cb090bb99d280ec2f0c991a75b62'";    
    console.log(cmd);
    var response;
    subProcess.exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error(err)
          process.exit(1)
        } else {
          response = JSON.parse(stdout.toString())
          console.log(response.value);
        }
      })

    res.render('pages/vm')
})

// app.listen(port, ()=>{
//   console.log(`App listening at localhost:${port}`);
// })