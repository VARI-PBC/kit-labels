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
  get componentTypes () {
    delete this.componentTypes;
    this.componentTypes = getComponentTypes();
    return this.componentTypes;
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

async function getComponentTypes () {
  const queryParams = {
    display_fields: [ 'lkup_supply_type.name', 'lkup_supply_type.supply_type_id' ],
    //criteria: [ 'lkup_supply_type.name!=@@Missing' ],
    criteria: [{ value: '@@Missing', operator: 'not equals', field: 'lkup_supply_type.name' }],
    sort_fields: [ 'lkup_supply_type.name' ],
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
async function getKitConfigs () {
  let labelConfigs = path.resolve(__dirname, 'label_configs');
  let fileNames = fs.readdirSync(labelConfigs);
  let configFiles = fileNames
    .filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(fs.readFileSync(
      path.resolve(labelConfigs, file), 'utf8')))
    .concat(fileNames
    .filter(file => file.endsWith('.js'))
    .map(file => require(path.resolve(labelConfigs, file))));
  let combinedConfigs = Array.prototype.concat(...configFiles);

  const expandWildcards = (prop, fullNames) => cfgs =>
    cfgs.map(cfg => !cfg[prop] ? cfg
        : fp.set(prop, cfg[prop].reduce((acc, pattern) => {
          let substitutedNames = fullNames.filter(fn =>
            new RegExp(`^${pattern.replace(/\*/g, '.*').replace(/_/g, '.')}$`).test(fn));
          return [...acc, ...substitutedNames];
        }, []), cfg));

  const normalizeProperty = (oldPropName, newPropName) => cfgs =>
    cfgs.map(cfg => !cfg[oldPropName] ? [cfg]
      : cfg[oldPropName].map(value =>
        fp.omit(oldPropName,
          fp.set(newPropName, value, cfg))));

  let kitTypeNames = (await cachedData.kitTypes).map(kt => kt.name);
  let componentTypeNames = (await cachedData.componentTypes).map(ct => ct.name);

  const normalizeConfigs = fp.flow(
    expandWildcards('kitTypes', kitTypeNames),
    normalizeProperty('kitTypes', 'kitType'),
    fp.flatten,
    expandWildcards('componentTypes', componentTypeNames),
    normalizeProperty('componentTypes', 'componentType'),
    fp.flatten,
    fp.groupBy('kitType'));
  return normalizeConfigs(combinedConfigs);
}

function generateLabelSequence (v) {
  if (!v.sequenceSpec) {
    return [];
  } else {
    var sequence = v.sequenceSpec
      .split(',')
      .reduce((prev, range) => {
        if (!range.includes('-')) {
          return [...prev, Number(range)];
        }
        let seq = fp.range(...range.split('-'));
        let last = fp.last(seq);
        return [...prev, ...seq, last + 1];
      }, []);
    if (v.padding) {
      return sequence.map(seq => (v.padding + seq).slice(-v.padding.length));
    }
    return sequence;
  }
}

async function buildKitComponents (resultSet, kitType) {
  let kitTypeName = (await cachedData.kitTypes).find(kt => kt.value === kitType).name;
  let kitConfig = (await cachedData.kitConfigs)[kitTypeName];
  let kitComponents = resultSet.map(function (row) {
    let kitComponent = {
      kitLabel: row[0],
      kitStatus: row[1],
      componentType: row[3],
      lotNumber: row[4],
      expiration: row[5],
      quantity: Number(row[6])
    };
    let labelConfig = kitConfig.find(cfg => cfg.componentType === kitComponent.componentType);
    const generateValues = variable => {
      let values = Array(kitComponent.quantity).fill(fp.flow(
            fp.replace(/%kitLabel%/g, kitComponent.kitLabel),
            fp.replace(/%lotNumber%/g, kitComponent.lotNumber),
            fp.replace(/%expiration%/g, kitComponent.expiration))(variable.value));
      let sequence = generateLabelSequence(variable);
      sequence.length = values.length;
      return fp.zipWith((val, seq) => !val ? null : val.replace('%sequence%', seq || ''),
          values, sequence);
    }
    if (labelConfig) {
      let labelFields = {
        labels: labelConfig.labels,
        headers: labelConfig.labelVariables.map(variable => variable.name),
        values: fp.zipAll(labelConfig.labelVariables.map(generateValues))
      };
      return Object.assign(kitComponent, labelFields);
    }
    return kitComponent;
  });
  let kitLabelConfig = kitConfig.find(cfg => typeof cfg.componentType === 'undefined');
  if (kitLabelConfig) {
    let kitGroups = fp.groupBy(row => row[0], resultSet);
    let kits = fp.map(pair => {
      let [key, group] = pair;
      let kitFields = {
        kitLabel: key,
        kitStatus: group[0][1],
        kitExpiration: group[0][2],
        componentType: '(kit labels)'
      };
      let components = group.reduce((components, row) => Object.assign(components, {
        [row[3]]: {
          lotNumber: row[4],
          expiration: row[5],
          quantity: Number(row[6])
        }}), {});
      let kitLabelFields = {
        labels: kitLabelConfig.labels,
        headers: kitLabelConfig.labelVariables.map(variable => variable.name),
        values: [kitLabelConfig.labelVariables.map(variable => {
          if (typeof variable.value === 'function') {
            return variable.value(kitFields, components);
          }
          return fp.flow(
            fp.replace(/%kitLabel%/g, kitFields.kitLabel),
            fp.replace(/%expiration%/g, kitFields.kitExpiration))(variable.value);
        })]};
      return Object.assign(kitFields, kitLabelFields);
    })(fp.toPairs(kitGroups));
    kitComponents = kitComponents.concat(kits);
  }
  return kitComponents.filter(kit => kit.labels);
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
    display_fields: ['kit.label', '+kit.status', 'kit.expiration_date', '+kit_component.supply_type', 'supply_inventory.lot_number', 'supply_inventory.expiration_date'],
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
    response.status(500).json(error.message);
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
