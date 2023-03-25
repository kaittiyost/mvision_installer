const dbConfig = require("../dbConfig");
const subProcess = require("child_process");
const mysql = require ( "mysql" );
var fs = require('fs'); 

let line =
  "###########################################################################";

const linuxConfigPage = (req, res) => {
  console.log(line);
  console.log("Linux config page request.");

  var sql = "SELECT * FROM hosts WHERE host_os = 'linux' ";
  dbConfig.connectionMySQL.query(sql, function (error, results, fields) {
    if (error) {
      console.log(error);
    } else {
      //console.log(results);

      // write inventory file..
      let inventory = '[linux] \n'
      for(i=0; i<results.length; i++){
        inventory += `node${i} ansible_host=${results[i].host_ip} ansible_connection=${results[i].protocol} ansible_user=${results[i].host_username} \n`
      }

      fs.writeFile(__dirname+'/../resources/inventory/linux_host.ini', inventory.toString() , function (err) {
        if (err) throw err;
        console.log('New text saved to file linux_host.ini!');
      });

      res.render("pages/linuxConfig", {
        HostList: results,
      });
    }
  });
};

const linuxGetHost = (req, res) => {
  console.log(line);
  console.log("Linux get host request.");

  var sql = "SELECT * FROM hosts WHERE host_os = 'linux' ";
  dbConfig.connectionMySQL.query(sql, function (error, results, fields) {
    if (error) {
      console.log(error);
    } else {
      //console.log(results);
      res.send(results)
    }
  });
};

const linuxAddHost = (req, res) => {
  console.log(line);
  console.log("Linux add host request.");
  let data_arr = req.body.data
  const obj = Object.keys(data_arr);
  var sqlCommand =
  "INSERT INTO hosts VALUES (null, ?, ?, ?, ?, ?, ?, current_timestamp) ";

  let msg = '';
  for(i=0; i<obj.length;i++){
    const hostip = data_arr[i][0];
    const username = data_arr[i][1];
    const password = data_arr[i][2];
    const os = data_arr[i][3];
    const os_type = data_arr[i][4];
    const protocol = data_arr[i][5];
    var sqlValue = [];
    sqlValue.push(hostip);
    sqlValue.push(username);
    sqlValue.push(password);
    sqlValue.push(os);
    sqlValue.push(os_type);
    sqlValue.push(protocol);

    var sql = mysql.format(sqlCommand, sqlValue);
    
    dbConfig.connectionMySQL.query(sql, function (error, results, fields) {
      if (error) {
        msg = 'fail'
        console.log(error);
      } else {
        msg = 'ok'
      }
    });
  }
  return res.send(msg);
};

const linuxDelHost = (req, res) => {
  console.log(line);
  console.log("Linux del host request.");
  const hostip = req.body.ipaddr;

  var sqlCommand = "DELETE FROM hosts WHERE hosts.host_ip = ? ";
  var sqlValue = [];
  sqlValue.push(hostip);

  var sql = mysql.format(sqlCommand, sqlValue);
  let msg;
  dbConfig.connectionMySQL.query(sql, function (error, results, fields) {
    if (error) {
      console.log(error);
      msg = 'fail'
    } else {
        msg = 'ok'
        return res.send(msg);
    }
  });
};


module.exports = {
  linuxConfigPage,
  linuxGetHost,
  linuxAddHost,
  linuxDelHost
};
