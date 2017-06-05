//@ts-check
/* global __dirname */
'use strict';
const fs = require('fs');
const path = require('path');
const config = require('./backendConfig');
const fp = require('lodash/fp');
//const https = require('https');
//const querystring = require('querystring');
const bodyParser = require('body-parser');
const dateformat = require('dateformat');

// Create an express app
var express = require('express');
var app = express();
app.use(bodyParser.json())

// Serve files from the dist directory
app.use('/', express.static(path.resolve(__dirname, 'dist')));

var ReportType = {
  LIST: 1,
  FREQUENCY: 2
};

// memoized global variables
var cachedData = {
  get sessionId () {
    if (!this._sessionId) {
      this._sessionId = logon();
    }
    return this._sessionId;
  },
  get kitTypes () {
    delete this.kitTypes;
    this.kitTypes = getKitTypes();
    return this.kitTypes;
  },
  get kitStatusLabels () {
    delete this.statusLabels;
    this.statusLabels = getKitStatusLabels();
    return this.statusLabels;
  },
  get kitConfigs () {
    delete this.kitConfigs;
    this.kitConfigs = getKitConfigs();
    return this.kitConfigs;
  }
}

var xmlrpc = require('xmlrpc');
var client = xmlrpc.createSecureClient(config.bsi.url);

/* log on to BSI
async function logon () {
  const options = {
    hostname: config.bsi.hostname,
    path: `/api/rest/${config.bsi.database}/common/logon`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/plain'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (d) => {
        if (res.statusCode < 200 || res.statusCode > 299) {
          var error = JSON.parse(d.toString());
          console.error(error);
          reject(error['message']);
        } else {
          resolve(d);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(querystring.stringify(config.bsi.logonArgs));
    req.end();
  });
}
*/
async function logon () {
  return new Promise((resolve, reject) => {
    let logonArgs = [config.bsi.logonArgs.username, config.bsi.logonArgs.password, config.bsi.database];
    client.methodCall('common.logon', logonArgs, function (error, d) {
      if (error) {
        console.error(error);
        reject(error['message']);
      } else {
        resolve(d);
      }
    });
  });
}

/* wrap BSI reporting interface
async function bsiQuery (queryParams) {
  const options = {
    hostname: config.bsi.hostname,
    path: `/api/rest/${config.bsi.database}/reports/list?`,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'BSI-SESSION-ID': await cachedData.sessionId
    }
  };
  options.path += querystring.stringify(queryParams);

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      var data = '';
      res.setEncoding('utf8');
      res.on('data', (d) => {
        data += d;
      });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode > 299) {
          var error = JSON.parse(data.toString());
          console.error(error);
          if (error['code'] === '9000') {
            delete cachedData._sessionId;
          }
          reject(error['message']);
        } else {
          var result = JSON.parse(data.toString());
          resolve(result['rows']);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}
*/
async function bsiQuery (queryParams) {
  var params = [await cachedData.sessionId, queryParams.criteria, queryParams.display_fields, queryParams.sort_fields, queryParams.limit, queryParams.report_type];
  return new Promise((resolve, reject) => {
    client.methodCall('report.execute', params, function (error, result) {
      if (error) {
        if (error['code'] >= 9000) {
          delete cachedData._sessionId;
        }
        reject(error['message']);
      } else {
        resolve(result['rows']);
      }
    });
  });
}

async function getKitTypes () {
  const queryParams = {
    display_fields: [ 'kit_template.name', 'kit_template.kit_template_id' ],
    //criteria: [ 'kit_template.name!=@@Missing' ],
    criteria: [{ value: '@@Missing', operator: 'not equals', field: 'kit_template.name' }],
    sort_fields: [ 'kit_template.study_id', 'kit_template.name' ],
    limit: 0,
    report_type: ReportType.LIST
  };

  var result = await bsiQuery(queryParams);
  return result.map(row => { return { name: row[0], value: row[1] }; });
}

async function getKitStatusLabels () {
  const queryParams = {
    display_fields: [ 'lkup_kit_status.label', 'lkup_kit_status.status_id' ],
    //criteria: [ 'lkup_kit_status.label!=@@Missing' ],
    criteria: [{ value: '@@Missing', operator: 'not equals', field: 'lkup_kit_status.label' }],
    sort_fields: [ 'lkup_kit_status.status_id' ],
    limit: 0,
    report_type: ReportType.LIST
  };

  var result = await bsiQuery(queryParams);
  return result.map(row => { return { label: row[0], id: parseInt(row[1]) }; });
}

// Read in label configs
function getKitConfigs () {
  return new Promise((resolve, reject) => {
    var labelConfigs = path.resolve(__dirname, 'label_configs');
    var fileNames = fs.readdirSync(labelConfigs);
    var configFiles = fp.flow(
      fp.filter(file => file.endsWith('.json')),
      fp.map(file => JSON.parse(fs.readFileSync(
        path.resolve(labelConfigs, file), 'utf8'))
      ))(fileNames);
    var mergedConfigs = Array.prototype.concat.apply([], configFiles);
    var kitConfigs = fp.flow(
      fp.map(cfg =>
        fp.map(kt => fp.flow( // expand kit types
          fp.set('kitType', kt),
          fp.omit('kitTypes'))(cfg)
        )(cfg.kitTypes)),
      fp.flatten,
      fp.map(cfg =>
        fp.map(ct => fp.flow( // expand component types
          fp.set('componentType', ct),
          fp.omit('componentTypes'))(cfg)
        )(cfg.componentTypes)),
      fp.flatten,
      fp.groupBy('kitType'))(mergedConfigs);
    resolve(kitConfigs);
  });
}

function generateLabelSequence (v) {
  if (!v.sequenceSpec) {
    return null;
  } else {
    var sequence = fp.flow(
      fp.split(','),
      fp.map(range => {
        if (!fp.includes('-', range)) {
          return Number(range);
        }
        let seq = fp.range.apply(null, fp.split('-', range));
        let last = fp.last(seq);
        return fp.concat(seq, last + 1);
      }),
      fp.flattenDeep
    )(v.sequenceSpec);
    if (v.padding) {
      return fp.map(seq => (v.padding + seq).slice(-v.padding.length), sequence);
    }
    return sequence;
  }
}

async function buildKitComponents (resultSet, kitType) {
  let kitTypeName = fp.find(kt => kt.value === kitType)(await cachedData.kitTypes).name;
  var kitConfig = (await cachedData.kitConfigs)[kitTypeName];
  var kits = resultSet.map(function (row) {
    let kitComponent = {
      kitLabel: row[0],
      kitStatus: row[1],
      componentType: row[2],
      quantity: Number(row[3])
    };
    let labelConfig = fp.find(cfg => cfg.componentType === kitComponent.componentType)(kitConfig);
    if (labelConfig) {
      var generateValues = variable =>
        fp.zipWith((val, seq) => fp.replace('%sequence%', seq || '', val),
            fp.times(fp.constant(
              fp.replace('%kitLabel%', kitComponent.kitLabel, variable.value)),
              kitComponent.quantity),
            generateLabelSequence(variable)
          );
      var labelFields = {
        labels: labelConfig.labels,
        headers: fp.map('name', labelConfig.labelVariables),
        values: fp.zipAll(fp.map(generateValues, labelConfig.labelVariables)),
        //sequences: fp.map(generateLabelSequence, labelConfig.labelVariables)
      };
      return fp.assign(kitComponent, labelFields);
    }
    return kitComponent;
  });
  return kits.filter(kit => kit.labels);
}


/// routes ///

app.get('/api/kitTypes', async function (request, response) {
  try {
    response.json(await cachedData.kitTypes);
  } catch (error) {
    response.status(500).json(error);
  }
});

app.get('/api/kitStatuses', async function (request, response) {
  try {
    response.json(await cachedData.kitStatusLabels);
  } catch (error) {
    response.status(500).json(error);
  }
});

app.get('/api/kits', async function (request, response) {
  const queryParams = {
    display_fields: ['kit.label', '+kit.status', '+kit_component.supply_type'],
    //criteria: [ `kit_template.kit_template_id=${request.query.kitType}`, `kit.status=${request.query.kitStatus}` ],
    criteria: [{value: request.query.kitStatus, operator: 'equals', field: 'kit.status'}, {value: request.query.kitType, operator: 'equals', field: 'kit_template.kit_template_id'}],
    sort_fields: [],
    limit: 10000,
    report_type: ReportType.FREQUENCY
  };

  try {
    var result = await bsiQuery(queryParams);
    var kits = await buildKitComponents(result, request.query.kitType);
    response.json(kits);
  } catch (error) {
    response.status(500).json(error);
  }
});

app.post('/api/printLabels', async function (request, response) {
  request.body.forEach(job => {
    let commands = `%BTW% /AF="${path.join(config.labels.templatePath, job[0].templateFile)}" /P /PRN="${job[0].printer}" /D=<Trigger File Name> /R=3 /X
%END%
`;
    var data = job[1].map(row => row.join('\t')).join('\n');
    fs.writeFileSync(config.bsi.logonArgs.username + '-' + dateformat(new Date(), 'yyyymmdd-HHMMss') + '.dat', commands + data);
  })
  response.status(200).send('Print job submitted.');
})

/// listener ///

app.set('port', 5000);
app.listen(5000, function (error) {
  if (error) throw error;
  console.log('app is running at localhost:5000');
})
