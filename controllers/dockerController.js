const dbConfig = require('../dbConfig');
let line = "###########################################################################";

const subProcess = require('child_process')


const dockerPS = (req, res) => {
    console.log(line);
    console.log('Docker ps request.');
    const cmd = `docker ps`;
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
}

const dockerRun = (req, res) => {

}

const dockerRestart = (req, res) => {

}
const dockerStop = (req, res) => {

}

module.exports = {
    dockerPS,
    dockerRun,
    dockerRestart,
    dockerStop,

}
  

