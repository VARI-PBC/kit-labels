//@ts-check
/* global __dirname */
'use strict';
var fs = require('fs');
var path = require('path');
var xmlrpc = require('xmlrpc');
var config = require('./backendConfig');
var fp = require('lodash/fp');

// Create an express app
var express = require('express');
var app = express();

var sessionId;
var kitTypes;
var kitConfigs;
var statusLabels;

// Serve files from the dist directory
app.use('/', express.static(path.resolve(__dirname, 'dist')));

// Create the XML-RPC client and log on to the BSI web service.
var client = xmlrpc.createSecureClient(config.bsi.url);
client.methodCall('common.logon', config.bsi.logonArgs, function (error, value) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  sessionId = value;

  // Periodically ping the web service to keep the session active.
  function ping () {
    client.methodCall('common.ping', [sessionId], function (error) {
      if (error) {
        if (error['code'] >= 9000) {
          client.methodCall('common.logon', config.bsi.logonArgs, function (error, value) {
            if (!error) {
              sessionId = value;
            }
          });
        }
      }
    });
  }
  setInterval(ping, config.bsi.pingInterval);

  // fetch kit types
  var criteria = [{
    value: '@@Missing',
    operator: 'not equals',
    field: 'kit_template.name'
  }];
  var display = ['kit_template.name', 'kit_template.kit_template_id'];
  var sort = ['kit_template.study_id', 'kit_template.name'];
  client.methodCall('report.execute', [sessionId, criteria, display, sort, 0, 1], function (error, result) {
    if (!error) {
      kitTypes = result.rows.map(function (row) { return { name: row[0], value: row[1] }; });
    }
  });

  // fetch kit statuses
  criteria = [{
    value: '@@Missing',
    operator: 'not equals',
    field: 'lkup_kit_status.label'
  }];
  client.methodCall('report.execute', [sessionId, criteria, ['lkup_kit_status.label'], [], 0, 1], function (error, result) {
    if (!error) {
      statusLabels = result.rows;
    }
  });
});


// Read in label configs
var labelConfigs = path.resolve(__dirname, 'label_configs');
var fileNames = fs.readdirSync(labelConfigs);
var configFiles = fp.flow(
  fp.filter(file => file.endsWith('.json')),
  fp.map(file => JSON.parse(fs.readFileSync(
    path.resolve(labelConfigs, file)).toString())
  ))(fileNames);
var mergedConfigs = Array.prototype.concat.apply([], configFiles);
kitConfigs = fp.flow(
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

function buildKitComponents (resultSet, kitType) {
  let kitTypeName = fp.find(kt => kt.value === kitType)(kitTypes).name;
  var kits = resultSet.rows.map(function (row) {
    let kitComponent = {
      kitLabel: row[0],
      kitStatus: row[1],
      componentType: row[2],
      quantity: Number(row[3])
    };
    let labelConfig = fp.find(cfg => cfg.componentType === kitComponent.componentType)(kitConfigs[kitTypeName]);
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

// kits/components query
function fetchKitComponents (kitType, kitStatus, callback) {
  let criteria = [
    {
      value: kitStatus,
      operator: 'equals',
      field: 'kit.status'
    },
    {
      value: kitType,
      operator: 'equals',
      field: 'kit_template.kit_template_id'
    }];
  let display = ['kit.label', '+kit.status', '+kit_component.supply_type'];
  client.methodCall('report.execute', [sessionId, criteria, display, [], 0, 2], function (error, result) {
    if (error) {
      if (error['code'] >= 9000) {
        client.methodCall('common.logon', config.bsi.logonArgs, function (error, value) {
          if (!error) {
            sessionId = value;
          }
        });
      }
    } else {
      var kits = buildKitComponents(result, kitType);
    }
    callback(kits, error);
  });
}


/// routes ///

app.get('/api/kitTypes', function (request, response) {
  response.json(kitTypes);
});

app.get('/api/statusLabels', function (request, response) {
  response.json(statusLabels);
});

app.get('/api/kits', function (request, response) {
  fetchKitComponents(request.query.kitType, request.query.kitStatus, function (kits, error) {
    if (error) {
      response.status(500).json(error);
    } else {
      response.json(kits);
    }
  });
});


/// listener ///

app.set('port', 5000);
app.listen(5000, function (error) {
  if (error) throw error;
  console.log('app is running at localhost:5000');
})
