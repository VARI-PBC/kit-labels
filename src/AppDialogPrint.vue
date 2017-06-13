<template>
<mdc-dialog
  id='print-dialog'
  title="Print selected labels via BarTender"
  ref="root"
  @cancel="labelGroups = []">
  <template v-for="group in labelGroups">
    <ul class="mdc-list mdc-list--two-line mdc-list--avatar-list">
      <li class="mdc-list-divider" role="separator"></li>
      <li class="mdc-list-item">
        <span class="mdc-list-item__start-detail">
          <select-all :items="group.labels" selectedKey="selected" />
        </span>
        <span class="mdc-list-item__text">{{ group.componentType }}
          <span class="mdc-list-item__text__secondary">{{ (group.description || group.templateFile) + '&ensp;(' + group.printer + ')' }}</span>
        </span>
      </li>
    </ul>
    <div class="mdc-layout-grid">
      <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-1"></div>
      <div class="mdc-layout-grid__cell" v-for="header in group.headers">{{ header }}</div>
    </div>
    <div class="mdc-layout-grid" v-for="row in group.labels">
      <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-1">
        <mdc-checkbox class="center-flex-item" v-model="row.selected" />
      </div>
      <div class="mdc-layout-grid__cell mdc-textfield mdc-textfield--fullwidth" v-for="(v,i) in row.variables">
        <input type="text" class="mdc-textfield__input" v-model="row.variables[i]">
      </div>
    </div>
    <br><br>
  </template>
  <footer class="mdc-dialog__footer" slot="footer">
    <button type="button" class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--cancel"
            @click="$refs.root.close()">
      Cancel
    </button>
    <button type="button" class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept"
            @click="submitLabelsToBarTender">
      Print
    </button>
  </footer>
</mdc-dialog>
</template>

<script>
import mdcDialog from './components/Dialog';
import mdcCheckbox from './components/Checkbox';
import SelectAll from './components/SelectAll';

export default {
  name: 'app-dialog-print',
  components: { mdcDialog, mdcCheckbox, SelectAll },
  props: {
    kitComponents: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      labelGroups: []
    }
  },
  methods: {
    generateLabelGroups () {
      var vm = this;
      let filteredItems = this.kitComponents.filter(item => item.selected);

      // expand and sort kit-component items to kit-label_type-component groups
      let labelGroups = filteredItems.reduce((prev, item) => {
        let expandedItems = item.labels.map(labelType => {
          Object.assign(labelType, {
            componentType: item.componentType,
            headers: item.headers,
            kitLabel: item.kitLabel,
          });
          vm.$set(labelType, 'labels', item.values.map(row => ({
            variables: row.slice(),
            selected: true
          })));
          return labelType;
        });

        return [...prev, ...expandedItems];
      }, []);

      let sortedGroups = labelGroups.sort((a, b) => {
        var sortOrder = a.kitLabel.localeCompare(b.kitLabel);
        if (sortOrder !== 0) return sortOrder;
        sortOrder = a.templateFile.localeCompare(b.templateFile);
        if (sortOrder !== 0) return sortOrder;
        return a.componentType.localeCompare(b.componentType);
      });

      return sortedGroups;
    },
    submitLabelsToBarTender () {
      let vm = this;
      let labelMap = new Map();
      this.labelGroups.forEach(group => {
        let key = { templateFile: group.templateFile, printer: group.printer };
        let value = [...(labelMap.get(key) || [group.headers]), ...group.labels.map(l => l.variables)];
        labelMap.set(key, value);
      });
      let data = JSON.stringify(Array.from(labelMap));
      fetch('api/printLabels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data })
      .then(function (response) {
        response.text().then(function (text) {
          vm.$root.$emit('notify', {
            message: text
          });
          vm.labelGroups = [];
        });
      });
    },
    show () {
      this.labelGroups = this.generateLabelGroups();
      this.$refs.root.show();
    }
  }
}
</script>

<style src="@material/typography/mdc-typography.scss" lang="scss"></style>
<style src="@material/textfield/mdc-textfield.scss" lang="scss"></style>
<style src="@material/button/mdc-button.scss" lang="scss"></style>
<style src="@material/layout-grid/mdc-layout-grid.scss" lang="scss"></style>

<style lang="scss">
#print-dialog {

  .mdc-dialog__surface {
    max-height: 90vh;
  }

  .mdc-dialog__body {
    max-height: inherit;
    overflow: scroll;
  }

  .mdc-layout-grid {
    --mdc-layout-grid-margin: 4px;
  }

  .mdc-textfield--fullwidth {
    height: 40px;
  }
}
</style>
