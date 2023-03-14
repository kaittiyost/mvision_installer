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
const os = require('os');
const ifaces = os.networkInterfaces();

let ipAddress = '';

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
  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      if (iface.family === 'IPv4' && iface.internal === false) {
        ipAddress = iface.address;
      }
    });
  });
  
  console.log(`Server IP address is ${ipAddress}`);

  var linuxHost = JSON.parse(fs.readFileSync('resources/inventory/linux_host.json','utf8')); 
  var windowsHost = JSON.parse(fs.readFileSync('resources/inventory/windows_host.json','utf8')); 
  //console.log(linuxHost);
  const linuxKeysArray = Object.keys(linuxHost);
  const linuxLength = linuxKeysArray.length;
  //console.log('> '+linuxLength); 

  const windowsKeysArray = Object.keys(windowsHost);
  const windowsLength = windowsKeysArray.length;
  //console.log('> '+windowsLength); 

  res.render('pages/index',{
    IPADDR : ipAddress,
    LINUXCOUNT : linuxLength,
    WINSCOUNT : windowsLength
  })
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
app.get('/vmware',(req,res) => {
  res.render('pages/vmwareConfig')
})
app.get('/prometheus',(req,res) => {
  res.render('pages/prometheusConfig')
})
app.get('/grafana',(req,res) => {
  res.render('pages/grafanaConfig')
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

app.get('/PrometheusConfig/ReadFileJSON',(req,res) => {
  var inventory = fs.readFileSync('prometheus/prometheus.json','utf8'); 
  console.log(inventory);
  let data ;
  if(inventory == ""){
    data = 'empty';
  }else{
    data = inventory;
  }
  res.status(200).send(data);
})

app.get('/VmwareConfig/ReadFileJSON',(req,res) => {
  var inventory = fs.readFileSync('resources/vmware/vsphere_host.json','utf8'); 
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

app.get('/VmwareConfig/ReadFile',(req,res) => {
  var inventory = fs.readFileSync(__dirname+'/resources/vmware/vsphere_host.json','utf8'); 
  //console.log(inventory);
  let data ;
  if(inventory == ""){
    data = 'empty';
  }else{
    data = inventory;
  }
  res.status(200).send(data);
})

app.post('/VmwareConfig/SaveFile',(req,res) => {
  //let statusYML = 0;
  //let statusJSON = 0;
  const hostip = req.body.hostip;
  let data = req.body.data 
  console.log(hostip);
  console.log('data[${hostip}]...');
  console.log(data[`${hostip}`]);

  // jsonPromData.collector[jsonPromData.collector.length] = new_job_obj;
  // console.log(JSON.stringify(jsonPromData));

  // Save .json
  var oldData = JSON.parse(fs.readFileSync('resources/vmware/vsphere_host.json','utf8')); 
  console.log("Old Data Before...");
  console.log(oldData);
  console.log('####################################');

  oldData[`${hostip}`] = data[`${hostip}`];

  console.log("\nOld Data After...");
  console.log(oldData);
  console.log('####################################');
  fs.writeFile(__dirname+'/resources/vmware/vsphere_host.json', JSON.stringify(oldData) , function (err) {
    if (err) throw err;
    console.log('New text appended to file vsphere_host.json!');
    statusJSON = 1;
  });

  res.status(200).send('ok')

})
app.post('/PrometheusConfig/SaveFile',(req,res) => {
  //let statusYML = 0;
  //let statusJSON = 0;
  let new_job = req.body.text 
  let new_job_obj = req.body.tempData
  console.log(jsonPromData);
  console.log(new_job_obj);
  console.log('length : '+jsonPromData.collector.length);
  jsonPromData.collector[jsonPromData.collector.length] = new_job_obj;
  console.log(JSON.stringify(jsonPromData));

  // Save .json
  var oldData = fs.readFileSync('prometheus/prometheus.json','utf8'); 
  console.log('####################################');
  let oldDataPrepare = JSON.parse(oldData);
  oldDataPrepare = JSON.stringify(jsonPromData);
  console.log(oldDataPrepare);

  fs.writeFile(__dirname+'/prometheus/prometheus.json', JSON.stringify(jsonPromData) , function (err) {
    if (err) throw err;
    console.log('New text appended to file Prom.yml!');
    statusJSON = 1;
  });

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

  // Write .yml
  fs.appendFile(__dirname+'/prometheus/prometheus.yml', new_job , function (err) {
    if (err) throw err;
    console.log('New text appended to file Prom.yml!');
    statusYML = 1;
  });

  // console.log('statusJSON :'+statusJSON);
  // console.log('statusYML :'+statusYML);

  res.status(200).send('ok')

})

app.post('/PrometheusConfig/EnSaveFile',(req,res) => {
  let new_cfg = req.body.cfg 
  console.log(new_cfg);
  fs.writeFile(__dirname+'/prometheus/prometheus.yml', new_cfg.toString() , function (err) {
    if (err) throw err;
    console.log('New text saved to file Prom.yml!');
    res.status(200).send('ok')
  });
})

app.post('/PrometheusConfig/EnSaveJsonFile',(req,res) => {
  let new_cfg = req.body.cfg 
  console.log(new_cfg);
  fs.writeFile(__dirname+'/prometheus/prometheus.json', new_cfg.toString() , function (err) {
    if (err) throw err;
    console.log('New text saved to file Prom.json!');
    res.status(200).send('ok')
  });
})

app.post('/VmwareConfig/EnSaveJsonFile',(req,res) => {
  let new_cfg = req.body.cfg 
  console.log(new_cfg);
  fs.writeFile(__dirname+'/resources/vmware/vsphere_host.json', new_cfg.toString() , function (err) {
    if (err) throw err;
    console.log('New text saved to file vsphere_host.json!');
    res.status(200).send('ok')
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
        //console.log(response);
        res.status(200).send(response);
      }
    })
})

app.post('/DockerRun',(req,res) => {
  const container_name = req.body.container_name;
  let cmd = "";
  if(container_name == "prometheus"){
    cmd = 'docker run -d --name prometheus  -p 9090:9090 -v $(pwd)/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus ';
  }else if(container_name == "grafana"){

    cmd = `docker run -d --name grafana -p 0.0.0.0:3000:300/tcp 
    -v /etc/grafana/certs:/etc/grafana/certs \
    -v /etc/grafana/grafana.ini:/etc/grafana/grafana.ini \
    -v /etc/grafana/home.json:/usr/share/grafana/public/dashboards/home.json \
    alansup/mvi 
    `;

  }else if(container_name == "vmware_exporter"){
    const hostip = req.body.hostip;
    const username = req.body.username;
    const password = req.body.password;
    const port = req.body.port;
    cmd = `
    docker run -d -it --rm  -p ${port}:9272 -e VSPHERE_USER=${username} \ 
    -e VSPHERE_PASSWORD=${password} \
    -e VSPHERE_HOST=${hostip} \
    -e VSPHERE_IGNORE_SSL=True -e VSPHERE_SPECS_SIZE=2000 \
    --name vmware_exporter pryorda/vmware_exporter
    `
  }
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