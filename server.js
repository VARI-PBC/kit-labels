//@ts-check
/* global __dirname */
'use strict';
const fs = require('fs');
const path = require('path');
const config = require('./backendConfig');
const bodyParser = require('body-parser');
const dateformat = require('dateformat');
const utils = require('./serverUtils');
const ds = require('./serverDataSource');

// Create an express app
var express = require('express');
var app = express();
app.use(bodyParser.json())

// Serve files from the dist directory
app.use('/', express.static(path.resolve(__dirname, 'dist')));

/// routes ///
app.get('/api/kitTypes', async function (request, response) {
  try {
    response.json(await utils.kitTypes);
  } catch (error) {
    response.status(500).json(error);
  }
});

app.get('/api/kitStatuses', async function (request, response) {
  try {
    response.json(await utils.kitStatusLabels);
  } catch (error) {
    response.status(500).json(error);
  }
});

app.get('/api/kits', async function (request, response) {
  const queryParams = {
    display_fields: ['kit.label', '+kit.status', 'kit.expiration_date', '+kit_component.supply_type', 'supply_inventory.lot_number', 'supply_inventory.expiration_date'],
    //criteria: [ `kit_template.kit_template_id=${request.query.kitType}`, `kit.status=${request.query.kitStatus}` ],
    criteria: [{value: request.query.kitStatus, operator: 'equals', field: 'kit.status'}, {value: request.query.kitType, operator: 'equals', field: 'kit_template.kit_template_id'}],
    sort_fields: [],
    limit: 10000,
    report_type: ds.ReportType.FREQUENCY
  };

  try {
    var result = await ds.query(queryParams);
    var kits = await utils.buildKitComponents(result, request.query.kitType);
    response.json(kits);
  } catch (error) {
    response.status(500).json(error.message);
  }
});

app.post('/api/printLabels', async function (request, response) {
  request.body.forEach((job, jobIndex) => {
    let commands = `%BTW% /AF="${path.join(config.labels.templatePath, job[0].templateFile)}" /P /PRN="${job[0].printer}" /D=<Trigger File Name> /R=3 /X\r
%END%\r
`;
    let data = job[1].map(row => row.join('\t')).join('\r\n');
    let filename = `${config.bsi.logonArgs.username}-${dateformat(new Date(), 'yyyymmdd-HHMMss')}-${jobIndex}.dat`;
    fs.writeFileSync(path.join(config.labels.jobsPath, filename), commands + data);
  })
  response.status(200).send('Print job submitted.');
})

/// listener ///

app.set('port', config.server.port);
app.listen(config.server.port, function (error) {
  if (error) throw error;
  console.log('app is running at localhost:' + config.server.port);
})
