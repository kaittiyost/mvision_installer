
const dbConfig = require('../dbConfig');

let line = "###########################################################################";

const isilonConfigPage = (req, res) => {
  console.log(line);
  console.log("isilon config page request.");

  var sql = "SELECT * FROM hosts WHERE host_os = 'isilon' ";
  dbConfig.connectionMySQL.query(sql, function (error, results, fields) {
    if (error) {
      console.log(error);
    } else {
      console.log(results);
      res.render("pages/isilonConfig", {
        HostList: results,
      });
    }
  });
};

module.exports ={
    isilonConfigPage
}
