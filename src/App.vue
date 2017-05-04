<template>
  <body id="app" class="mdc-typography">
    <!-- Header -->
    <toolbar title="Kit labels">
      <mdc-select slot="section-end" class="mdc-theme--text-primary-on-dark"
          value="Select kit type"
          @input="(value) => { this.fetchKitComponents(value, 'Available'); }"
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
            <a class="mdc-list-item" href="#">
              Select statuses...
            </a>
          </nav>
        </div>
      </nav>
      <!-- Main content -->
      <main class="main">
        <template v-for="items in kits">
          <p></p>
          <table class="mdl-data-table mdl-js-data-table">
            <thead>
              <tr class="mdl-color--grey-300 mdl-color-text--grey-600 mdl-typography--font-bold">
                <td class="mdl-data-table__cell--non-numeric">Kit label</td>
                <td class="mdl-data-table__cell--non-numeric">Kit status</td>
              </tr>
            </thead>
            <tbody>
              <tr class="mdl-color--grey-300 mdl-color-text--grey-800">
                <td class="mdl-data-table__cell--non-numeric">{{ items[0].kitLabel }}</td>
                <td class="mdl-data-table__cell--non-numeric">{{ items[0].kitStatus }}</td>
              </tr>
            </tbody>
          </table>
          <p></p>
          <table class="mdl-data-table mdl-js-data-table mdl-data-table--selectable">
            <thead>
              <tr class="mdl-color--grey-50 mdl-color-text--grey-600 mdl-typography--font-bold">

                <td class="mdl-data-table__cell--non-numeric">Component</td>
                <td>Quantity</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" class="mdl-color--grey-50">
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
      </main>
    </div>
  </body>
</template>

<script>
import Toolbar from './components/Toolbar';
import mdcSelect from './components/Select';
import {MDCTextfield} from '@material/textfield';
import Snackbar from './components/Snackbar';


export default {
  name: 'app',
  components: { Toolbar, mdcSelect, Snackbar },
  data () {
    return {
      kitTypes: [],
      kitComponents: [],
      loading: false
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
    fetchKitComponents (kitType, kitStatus) {
      var vm = this;
      vm.loading = true;
      fetch('api/kits?kitType=' + kitType + '&kitStatus=' + kitStatus)
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
                vm.fetchKitComponents(kitType, kitStatus);
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
          response.json().then(function (json) {
            vm.kitTypes = vm.kitTypes.concat(json);
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
  },
  mounted () {
    // wire up MDC components
    MDCTextfield.attachTo(this.$refs.search);
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
<style src="./assets/data-table/data-table.scss" lang="scss"></style>

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
}
</style>
