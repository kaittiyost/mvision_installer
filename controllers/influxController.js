const dbConfig = require('../dbConfig');

let line = "###########################################################################";
const IP = require('ip');
let ipAddress;

const influxConfigPage = (req, res) => {
    console.log(line);
    console.log("InflluxDB config page request.");
    ipAddress = IP.address();
    console.log(`Server IP address is ${ipAddress}`);

    var sql = "SELECT * FROM hosts WHERE host_os = 'vmware' ";
    dbConfig.connectionMySQL.query ( sql, function ( error, results, fields ){
          if ( error ) {
              console.log ( error );
          }else {
              console.log(results);
              res.render('pages/influxdbConfig',{
                HostList : results,
                IPADDR : ipAddress
              })
          }
      });
};

module.exports ={
    influxConfigPage
}
