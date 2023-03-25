
const dbConfig = require('../dbConfig');
const axios = require('axios');
const subProcess = require('child_process')
//const puppeteer = require( 'puppeteer')

let line = "###########################################################################";

const IP = require('ip');
let ipAddress;

const homePage = (req, res) => {
    console.log(line);
    console.log("Vmware config page request.");
    ipAddress = IP.address();
    console.log(`Server IP address is ${ipAddress}`);

    res.render("pages/grafanaConfig", {
        IPADDR : ipAddress,
    });
};
const createDashboardPage = (req, res) => {
    console.log(line);
    console.log("Create dashboard  page request.");
    ipAddress = IP.address();
    console.log(`Server IP address is ${ipAddress}`);

    res.render("pages/createReport", {
        IPADDR : ipAddress,
    });
};

const GetDashbaord = (req, res) => {
  console.log(line);
  console.log("Get dashboard request.");

  // test roHB5Of4k
  // pm  W5KDrdKnz
  let dashboardUID = 'W5KDrdKnz';
  let cmd = `curl -k --location 'https://10.4.160.170:3000/api/dashboards/uid/${dashboardUID}' \
  --header 'Authorization: Bearer eyJrIjoiWXBlYzBOa0ZvZkUwMkprV3ZHYmMwRkZWRnIyN0pPcVkiLCJuIjoid293IiwiaWQiOjF9'`
  
  var response;
  subProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        res.status(500).send(stderr);
      } else {
        response = JSON.parse(stdout)
        // console.log(response.dashboard);
        res.status(200).send(response.dashboard.panels);
      }
    })
};

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
    
//     await page.goto('http://localhost:3009/grafana/createDashboardPage', {
//       waitUntil: 'networkidle2'
//     });
    
//     await page.pdf({
//         path: 'lcs.pdf',
//         format: 'letter',
//     });
    
//     await browser.close();
// })();

module.exports ={
    homePage,
    GetDashbaord,
    createDashboardPage
}
