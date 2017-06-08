//@ts-check

//const https = require('https');
//const querystring = require('querystring');
const config = require('./backendConfig');

var xmlrpc = require('xmlrpc');
var client = xmlrpc.createSecureClient(config.bsi.url);

var ds = {
  ReportType: {
    LIST: 1,
    FREQUENCY: 2
  },
  get sessionId () {
    if (!this._sessionId) {
      this._sessionId = this.logon();
    }
    return this._sessionId;
  },

  /* log on to BSI
  logon: async function () {
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
  },
  */
  logon: async function () {
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
  },

  /* wrap BSI reporting interface
  query: async function (queryParams) {
    let self = this;
    const options = {
      hostname: config.bsi.hostname,
      path: `/api/rest/${config.bsi.database}/reports/list?`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'BSI-SESSION-ID': await self.sessionId
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
              delete self._sessionId;
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
  },
  */
  query: async function (queryParams) {
    let self = this;
    var params = [await this.sessionId, queryParams.criteria, queryParams.display_fields, queryParams.sort_fields, queryParams.limit, queryParams.report_type];
    return new Promise((resolve, reject) => {
      client.methodCall('report.execute', params, function (error, result) {
        if (error) {
          if (error['code'] >= 9000) {
            delete self._sessionId;
          }
          reject(error['message']);
        } else {
          resolve(result['rows']);
        }
      });
    });
  }
}

module.exports = ds;
