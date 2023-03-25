const dbConfig = require('../dbConfig');
const mysql = require("mysql");
var fs = require('fs'); 
let line = "###########################################################################";

const vmwareConfigPage = (req, res) => {
    console.log(line);
    console.log("Vmware config page request.");
  
    var sql = "SELECT * FROM hosts WHERE host_os = 'vmware' ";
    dbConfig.connectionMySQL.query ( sql, function ( error, results, fields ){
          if ( error ) {
              console.log ( error );
          }else {
              console.log(results);
              res.render('pages/vmwareConfig',{
                HostList : results
              })
          }
      });
};

const vmwareGetHost = (req, res) => {
    console.log(line);
    console.log("Vmware get host request.");
  
    var sql = "SELECT * FROM hosts WHERE host_os = 'vmware' ";
    dbConfig.connectionMySQL.query(sql, function (error, results, fields) {
      if (error) {
        console.log(error);
      } else {
        //console.log(results);
        res.send(results)
      }
    });
  };

const vmwareAddHost = (req, res) => {
    console.log(line);
    console.log("Vmware add host request.");
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

  const vmwareDelHost = (req, res) => {
    console.log(line);
    console.log("Vmware del host request.");
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

module.exports ={
    vmwareConfigPage,
    vmwareGetHost,
    vmwareAddHost,
    vmwareDelHost
}
