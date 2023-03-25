const dbConfig = require('../dbConfig');
const mysql = require("mysql");
var fs = require('fs'); 
let line = "###########################################################################";
const IP = require('ip');
let ipAddress;

const promeConfigPage = (req, res) => {
    console.log(line);
    console.log("Prometheus config page request.");
    ipAddress = IP.address();
    console.log(`Server IP address is ${ipAddress}`);

    var sql = "SELECT * FROM prometheus_job";
    dbConfig.connectionMySQL.query ( sql, function ( error, results, fields ){
          if ( error ) {
              console.log ( error );
          }else {
              console.log(results);
              res.render('pages/prometheusConfig',{
                HostList : results,
                IPADDR : ipAddress
              })
          }
      });
};

const promeAddJob = (req, res) => {
    console.log(line);
    console.log("Prometheus add job request.");
    const job_name = req.body.job_name;
  
    var sqlCommand = "INSERT INTO prometheus_job VALUE(NULL, ?, current_timestamp)";
    var sqlValue = [];
    sqlValue.push(job_name);
  
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

  const promeDelJob = (req, res) => {
    console.log(line);
    console.log("Prometheus del job request.");
    const job_name = req.body.job_name;
  
    var sqlCommand = "DELETE FROM prometheus_job WHERE prometheus_job.job_name = ? ";
    var sqlValue = [];
    sqlValue.push(job_name);
  
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
    promeConfigPage,
    promeAddJob,
    promeDelJob
}
