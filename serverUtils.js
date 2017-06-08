//@ts-check
const ds = require('./serverDataSource');
const fs = require('fs');
const path = require('path');
const fp = require('lodash/fp');

// memoized global variables
var utils = {
  get kitTypes () {
    delete this.kitTypes;
    this.kitTypes = this.getKitTypes();
    return this.kitTypes;
  },
  get componentTypes () {
    delete this.componentTypes;
    this.componentTypes = this.getComponentTypes();
    return this.componentTypes;
  },
  get kitStatusLabels () {
    delete this.statusLabels;
    this.statusLabels = this.getKitStatusLabels();
    return this.statusLabels;
  },
  get kitConfigs () {
    delete this.kitConfigs;
    this.kitConfigs = this.getKitConfigs();
    return this.kitConfigs;
  },

  getKitTypes: async function () {
    const queryParams = {
      display_fields: [ 'kit_template.name', 'kit_template.kit_template_id' ],
      //criteria: [ 'kit_template.name!=@@Missing' ],
      criteria: [{ value: '@@Missing', operator: 'not equals', field: 'kit_template.name' }],
      sort_fields: [ 'kit_template.study_id', 'kit_template.name' ],
      limit: 0,
      report_type: ds.ReportType.LIST
    };

    var result = await ds.query(queryParams);
    return result.map(row => { return { name: row[0], value: row[1] }; });
  },

  getComponentTypes: async function () {
    const queryParams = {
      display_fields: [ 'lkup_supply_type.name', 'lkup_supply_type.supply_type_id' ],
      //criteria: [ 'lkup_supply_type.name!=@@Missing' ],
      criteria: [{ value: '@@Missing', operator: 'not equals', field: 'lkup_supply_type.name' }],
      sort_fields: [ 'lkup_supply_type.name' ],
      limit: 0,
      report_type: ds.ReportType.LIST
    };

    var result = await ds.query(queryParams);
    return result.map(row => { return { name: row[0], value: row[1] }; });
  },

  getKitStatusLabels: async function () {
    const queryParams = {
      display_fields: [ 'lkup_kit_status.label', 'lkup_kit_status.status_id' ],
      //criteria: [ 'lkup_kit_status.label!=@@Missing' ],
      criteria: [{ value: '@@Missing', operator: 'not equals', field: 'lkup_kit_status.label' }],
      sort_fields: [ 'lkup_kit_status.status_id' ],
      limit: 0,
      report_type: ds.ReportType.LIST
    };

    var result = await ds.query(queryParams);
    return result.map(row => { return { label: row[0], id: parseInt(row[1]) }; });
  },

// Read in label configs
  getKitConfigs: async function () {
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

    let kitTypeNames = (await this.kitTypes).map(kt => kt.name);
    let componentTypeNames = (await this.componentTypes).map(ct => ct.name);

    const normalizeConfigs = fp.flow(
      expandWildcards('kitTypes', kitTypeNames),
      normalizeProperty('kitTypes', 'kitType'),
      fp.flatten,
      expandWildcards('componentTypes', componentTypeNames),
      normalizeProperty('componentTypes', 'componentType'),
      fp.flatten,
      fp.groupBy('kitType'));
    return normalizeConfigs(combinedConfigs);
  },

  generateLabelSequence: function (v) {
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
  },

  buildKitComponents: async function (resultSet, kitType) {
    let self = this;
    let kitTypeName = (await this.kitTypes).find(kt => kt.value === kitType).name;
    let kitConfig = (await this.kitConfigs)[kitTypeName];
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
        let sequence = self.generateLabelSequence(variable);
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
}

module.exports = utils;
