
const dbConfig = require('../dbConfig');

let line = "###########################################################################";

const IP = require('ip');
let ipAddress;
const homePage = (req, res) => {
  console.log(line);
  console.log("Honepage request.");

  ipAddress = IP.address();
  console.log(`Server IP address is ${ipAddress}`);

  var sql = "SELECT * FROM docker_services";
  dbConfig.connectionMySQL.query(sql, function (error, results, fields) {
    if (error) {
      console.log(error);
    } else {
      console.log(results);
      res.render("pages/index", {
        HostList: results,
        IPADDR : ipAddress,
        LINUXCOUNT: 0,
        WINSCOUNT : 0
      });
    }
  });
};

module.exports ={
    homePage
}
