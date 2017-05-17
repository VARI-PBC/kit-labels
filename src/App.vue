<template>
  <body id="app" class="mdc-typography">
    <!-- Header -->
    <toolbar>
      <button slot="section-start" class="drawer-menu material-icons"
              @click="() => {drawer.open = !drawer.open;}">menu</button>
      <span slot="section-start" class="mdc-toolbar__title catalog-title">Kit labels</span>
      <mdc-select slot="section-end" class="mdc-theme--text-primary-on-dark"
          v-model="selectedKitType"
          @selected="fetchKitComponents"
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
      <aside class="mdc-persistent-drawer" ref="drawer">
        <nav class="mdc-persistent-drawer__drawer">
          <div class="mdc-list-group">
            <nav class="mdc-list">
              <a class="mdc-list-item mdc-persistent-drawer--selected" href="#">
                Kits/components
              </a>
            </nav>
            <hr class="mdc-list-divider">
            <nav class="mdc-list">
              <a class="mdc-list-item" @click="$refs.statuses.show()">
                Select kit statuses...
              </a>
            </nav>
          </div>
        </nav>
      </aside>
      <!-- Main content -->
      <main class="main">
        <div class="table-header">
          <div class="table-header__summary">
            <div class="table-header__centered-content">
              <select-all :items="kitComponents" :selectedKey="'selected'"></select-all>
            </div>
            <span class="table-header__header">Kit label</span>
            <span class="table-header__secondary-content">Status</span>
          </div>
        </div>
        <details class="mdc-expansion" v-for="items in kits" >
          <summary class="mdc-expansion__summary">
            <div class="mdc-expansion__centered-content">
              <select-all :items="items" :selectedKey="'selected'"></select-all>
            </div>
            <span class="mdc-expansion__header">{{ items[0].kitLabel }}</span>
            <span class="mdc-expansion__secondary-content">{{ items[0].kitStatus }}</span>
          </summary>
          <div  class="mdc-expansion__content">
            <table ref="componentsTables" class="mdl-data-table">
              <tbody>
                <tr v-for="item in items">
                  <td>
                    <mdc-checkbox v-model="item.selected" />
                  </td>
                  <td class="mdl-data-table__cell--non-numeric">{{ item.componentType }}</td>
                  <td>{{ item.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
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
                <mdc-checkbox :id="'my-checkbox-'+status.id" :labelId="'my-checkbox-label-'+status.id" :value="status.id" v-model="selectedKitStatuses" />
                <label :id="'my-checkbox-label-'+status.id" :for="'my-checkbox-'+status.id">{{ status.label }}</label>
              </div>
            </div>
          </section>
          <footer class="mdc-dialog__footer">
            <button type="button" class="mdc-button mdc-dialog__footer__button"
                    @click="() => { fetchKitComponents(); $refs.statuses.close(); }">
              Update
            </button>
          </footer>
        </mdc-dialog>
      </main>
    </div>
  </body>
</template>

<script>
import Toolbar from './components/Toolbar';
import mdcSelect from './components/Select';
import {MDCTextfield} from '@material/textfield';
import {MDCPersistentDrawer} from '@material/drawer';
import Snackbar from './components/Snackbar';
import mdcDialog from './components/Dialog';
import mdcCheckbox from './components/Checkbox';
import SelectAll from './components/SelectAll';

export default {
  name: 'app',
  components: { Toolbar, mdcSelect, MDCPersistentDrawer, Snackbar, mdcDialog, mdcCheckbox, SelectAll },
  data () {
    return {
      kitTypes: [],
      selectedKitType: 'Select kit type',
      kitStatuses: [],
      kitComponents: [],
      loading: false,
      dataTable: null,
      selectedKitStatuses: [1]
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
    fetchKitComponents () {
      var vm = this;
      if (!vm.selectedKitType || vm.selectedKitStatuses.length === 0) {
        if (!vm.selectedKitType) {
          vm.$root.$emit('notify', {
            message: 'You must first select a kit type.',
            timeout: 3000
          });
        }
        if (vm.selectedKitStatuses.length === 0) {
          vm.$root.$emit('notify', {
            message: 'You must select at least one kit status.',
            timeout: 3000
          });
        }
        return;
      }
      vm.loading = true;
      fetch('api/kits?kitType=' + vm.selectedKitType + '&kitStatus=' + vm.selectedKitStatuses.join(';'))
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
              vm.fetchKitComponents();
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
    this.drawer = MDCPersistentDrawer.attachTo(this.$refs.drawer)
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
<style src="@material/drawer/persistent/mdc-persistent-drawer.scss" lang="scss"></style>
<style src="@material/button/mdc-button.scss" lang="scss"></style>
<style src="./assets/mdl/data-table/data-table.scss" lang="scss"></style>
<style src="@material/list/mdc-list.scss" lang="scss"></style>
<style src="@material/form-field/mdc-form-field.scss" lang="scss"></style>
<style src="./components/mdc-expansion.scss" lang="scss"></style>

<style lang="scss">

.material-icons {
  text-decoration: none;
  cursor: pointer;
}

/* A simple menu button. */
.drawer-menu {
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  padding: 0;
  margin: 0;
  margin-right: 24px;
  color: #FFF;
  box-sizing: border-box;
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
  padding: 24px;
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

.table-header {
  border-bottom: 1px solid rgba(0, 0, 0, .12);
  /** Just for demo **/
  width: 700px;
  box-sizing: border-box;
  background-color: rgb(224,224,224);

  &__summary {
    padding: 6px 24px;
    height: 48px;
    display: flex;
    outline: none;
  }
  
  &__header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 1.0625rem;
    font-weight: 700;
    flex-basis: 30%;
    color: rgba(0, 0, 0, .45);
    margin-right: 16px;
  }
  
  &__subheader {
    font-size: .75rem;
    color: rgba(0, 0, 0, .54);
  }
  
  &__secondary-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 1.0625rem;
    font-weight: 700;
    flex-basis: 30%;
    color: rgba(0, 0, 0, .45);
    margin-right: 16px;
  }

  &__centered-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 16px;
  }
}

</style>
