const express = require('express')
const app = express()
const port = 3009
const path = require("path")
var fs = require('fs'); 

let token;
const subProcess = require('child_process')

app.set('view engine','ejs')

const oneDay = 1000 * 60 * 60 * 24;

let assetsDir = path.join(__dirname,"assets")
app.use('/assets',express.static(assetsDir))

app.use(express.urlencoded({ extended: true }))

app.get('/',(req,res) => {
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
app.get('/ReadFile',(req,res) => {
  var inventory = fs.readFileSync('resources/inventory/linux_host.json','utf8'); 
  console.log(inventory);
  let data ;
  if(inventory == ""){
    data = 'empty';
  }else{
    data = inventory;
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

app.get('/InstallNodeExporter',(req,res) => {
  const cmd = `
  cat $(pwd)/resources/inventory/linux_host.ini \
  ansible-playbook  $(pwd)/resources/playbook/install-node-exporter.yml -i $(pwd)/resources/inventory/linux_host.ini
  `;
  var response;
  subProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        process.exit(1)
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

app.listen(port, ()=>{
    console.log(`App listening at localhost:${port}`);
})