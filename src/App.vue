<template>
  <body id="app" class="mdc-typography">
    <!-- Header -->
    <toolbar title="Kit labels">
      <mdc-select slot="section-end" class="mdc-theme--text-primary-on-dark"
          value="Select kit type"
          @input="value => { fetchKitComponents(value, selectedStatuses); }"
          :options="kitTypes">
        <template scope="item">
          <li class="mdc-list-item" role="option" :id="item.optionValue" tabindex="0">
            {{item.optionName}}
          </li>
        </template>
      </mdc-select>
      <label slot="section-end" ref="search" class="mdc-textfield search-box">
        <input type="text" class="mdc-textfield__input mdc-theme--text-primary-on-dark">
        <span class="mdc-textfield__label mdc-theme--text-secondary-on-dark">Search kits</span>
      </label>
    </toolbar>
    <div class="content mdc-toolbar-fixed-adjust">
      <!-- Navigation -->
      <nav ref="drawer" class="mdc-permanent-drawer">
        <div class="mdc-list-group">
          <nav class="mdc-list">
            <a class="mdc-list-item mdc-permanent-drawer--selected" href="#">
              Group by kits
            </a>
            <a class="mdc-list-item" href="#">
              Group by components
            </a>
          </nav>
          <hr class="mdc-list-divider">
          <nav class="mdc-list">
            <a class="mdc-list-item" href="#">
              Kit manifests
            </a>
          </nav>
          <hr class="mdc-list-divider">
          <nav class="mdc-list">
            <a class="mdc-list-item" @click="$refs.statuses.show()">
              Select statuses...
            </a>
          </nav>
        </div>
      </nav>
      <!-- Main content -->
      <main class="main">
        <template v-for="items in kits">
          <p></p>
          <table class="mdl-data-table">
            <thead>
              <tr>
                <th class="mdl-data-table__cell--non-numeric">Kit label</th>
                <th class="mdl-data-table__cell--non-numeric">Kit status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="mdl-data-table__cell--non-numeric">{{ items[0].kitLabel }}</td>
                <td class="mdl-data-table__cell--non-numeric">{{ items[0].kitStatus }}</td>
              </tr>
            </tbody>
          </table>
          <p></p>
          <table ref="componentsTables" class="mdl-data-table mdl-js-data-table mdl-data-table--selectable">
            <thead>
              <tr>
                <th class="mdl-data-table__cell--non-numeric">Component</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items">
                <td class="mdl-data-table__cell--non-numeric">{{ item.componentType }}</td>
                <td>{{ item.quantity }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <button id="print-selected" 
                @click="printSelected" 
                class="mdc-button mdc-button--accent mdc-button--raised">
          <span>Print selected</span>
        </button>
        <snackbar event="notify"></snackbar>
        <mdc-dialog 
          title="Choose kit statuses to include in query"
          ref="statuses"
          :useDefaultFooter="false"
          ariaDescription="my-mdc-dialog-description">
          <section id="my-mdc-dialog-description" class="mdc-dialog__body">
            <div class="two-columns">
              <div v-for="status in kitStatuses" class="mdc-form-field">
                <mdc-checkbox :id="'my-checkbox-'+status.id" :labelId="'my-checkbox-label-'+status.id" :value="status.id" v-model="selectedStatuses" />
                <label :id="'my-checkbox-label-'+status.id" :for="'my-checkbox-'+status.id">{{ status.label }}</label>
              </div>
            </div>
          </section>
        </mdc-dialog>
      </main>
    </div>
  </body>
</template>

<script>
/* global componentHandler */
import Toolbar from './components/Toolbar';
import mdcSelect from './components/Select';
import {MDCTextfield} from '@material/textfield';
import Snackbar from './components/Snackbar';
import mdcDialog from './components/Dialog';
import mdcCheckbox from './components/Checkbox';
require('./assets/mdl/mdlComponentHandler');
require('./assets/mdl/data-table/data-table');
require('./assets/mdl/checkbox/checkbox');

export default {
  name: 'app',
  components: { Toolbar, mdcSelect, Snackbar, mdcDialog, mdcCheckbox },
  data () {
    return {
      kitTypes: [],
      kitStatuses: [],
      kitComponents: [],
      loading: false,
      dataTable: null,
      selectedStatuses: []
    }
  },
  computed: {
    kits () {
      var vm = this;
      return vm.kitComponents.reduce(function (grouped, item) {
        grouped[item.kitLabel] = grouped[item.kitLabel] || [];
        grouped[item.kitLabel].push(item);
        return grouped;
      }, Object.create(null));
    },
    components () {
      var vm = this;
      return vm.kitComponents.reduce(function (grouped, item) {
        grouped[item.componentType] = grouped[item.componentType] || [];
        grouped[item.componentType].push(item);
        return grouped;
      }, Object.create(null));
    }
  },
  methods: {
    fetchKitComponents (kitType, kitStatuses) {
      var vm = this;
      vm.loading = true;
      fetch('api/kits?kitType=' + kitType + '&kitStatus=' + kitStatuses.join(';'))
      .then(function (response) {
        vm.loading = false;
        if (response.ok) {
          response.json().then(function (kitComponents) {
            vm.kitComponents = kitComponents.map(function (item) {
              item.selected = false;
              return item;
            });
          });
        } else {
          vm.$root.$emit('notify', {
            message: 'Fetch kit data failed.',
            actionHandler: () => {
              vm.fetchKitComponents(kitType, kitStatuses);
            },
            actionText: 'Retry',
            timeout: 5000
          });
        }
      });
    },
    printSelected () {
      this.$root.$emit('notify', {
        message: 'Selected: ' + 1,
        timeout: 2000
      })
    }
  },
  created () {
    var vm = this;
    fetch('api/kitTypes')
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          vm.kitTypes = data;
        });
      } else {
        this.$root.$emit('notify', {
          message: 'Unexpected server error. Try reloading the page.',
          actionHandler: () => {
            window.location.reload(true);
          },
          actionText: 'Reload',
          timeout: 5000
        });
      }
    });
    fetch('api/kitStatuses')
    .then(response => {
      if (response.ok) {
        response.json().then(function (data) {
          vm.kitStatuses = data;
        });
      } else {
        this.$root.$emit('notify', {
          message: 'Unexpected server error. Try reloading the page.',
          actionHandler: () => {
            window.location.reload(true);
          },
          actionText: 'Reload',
          timeout: 5000
        });
      }
    })
  },
  mounted () {
    // wire up MDC components
    MDCTextfield.attachTo(this.$refs.search);
  },
  updated () {
    if (this.$refs.componentsTables !== undefined && this.$refs.componentsTables.length > 0) {
      componentHandler.upgradeElements(this.$refs.componentsTables);
    }
  }
}
</script>

<style lang="scss">
$mdc-theme-primary: #009688;
$mdc-theme-accent: #f57c00;
$mdc-theme-background: #fff;

@import "@material/theme/mdc-theme";
</style>

<style src="@material/typography/mdc-typography.scss" lang="scss"></style>
<style src="@material/textfield/mdc-textfield.scss" lang="scss"></style>
<style src="@material/drawer/permanent/mdc-permanent-drawer.scss" lang="scss"></style>
<style src="@material/button/mdc-button.scss" lang="scss"></style>
<style src="./assets/mdl/data-table/data-table.scss" lang="scss"></style>
<style src="./assets/mdl/checkbox/checkbox.scss" lang="scss"></style>
<style src="@material/list/mdc-list.scss" lang="scss"></style>
<style src="@material/form-field/mdc-form-field.scss" lang="scss"></style>

<style lang="scss">

.material-icons {
  text-decoration: none;
  cursor: pointer;
}

/* Place drawer and main next to each other. */
.content {
  display: flex;
  height: 100%;
  box-sizing: border-box;
}

.main {
  margin-left: auto;
  margin-right: auto;
}

.mdc-textfield.search-box {
  margin: 0 16px;
  height: 32px !important;
}

#print-selected {
  position: fixed;
  display: block;
  right: 0;
  bottom: 0;
  margin-right: 40px;
  margin-bottom: 40px;
  z-index: 900;
}

@import "@material/elevation/mixins";

.mdl-data-table {
  @include mdc-elevation(2);

  thead {
    background-color: rgb(224,224,224);
    color: rgb(117,117,117);
    font-weight: 500;
  }
}

.two-columns {
  -webkit-column-count: 2;
  -webkit-column-gap: 20px;
  -moz-column-count: 2;
  -moz-column-gap: 20px;
  column-count: 2;
  column-gap: 20px;

  .mdc-form-field {
    width: 100%;
  }
}


</style>
