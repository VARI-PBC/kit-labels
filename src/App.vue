<template>
  <body id="app" class="mdc-typography">
    <!-- Header -->
    <toolbar>
      <span slot="section-start" class="mdc-toolbar__title catalog-title">Kit labels</span>
      <mdc-select slot="section-end" class="mdc-theme--text-primary-on-dark" v-model="selectedKitType" @selected="fetchKitComponents" :options="kitTypes">
        <template scope="item">
          <li class="mdc-list-item" role="option" :id="item.optionValue" tabindex="0">
            {{item.optionName}}
          </li>
        </template>
      </mdc-select>
      <label slot="section-end" ref="search" class="mdc-textfield search-box">
        <input type="text" class="mdc-textfield__input mdc-theme--text-primary-on-dark" v-model="filterBy">
        <span class="mdc-textfield__label mdc-theme--text-secondary-on-dark">Search kits</span>
      </label>
      <button slot="section-end" class="toolbar-button material-icons" @click="$refs.statuses.show()">settings</button>
    </toolbar>
    <div class="content mdc-toolbar-fixed-adjust">
      <!-- Main content -->
      <main class="main">
        <section id="tab-nav">
          <nav ref="tabs" id="tab-bar" class="mdc-tab-bar mdc-tab-bar--indicator-accent" role="tablist" @MDCTabBar:change="updatePanel">
            <a role="tab" aria-controls="panel-1" class="mdc-tab mdc-tab--active" href="#panel-1">By Kit</a>
            <a role="tab" aria-controls="panel-2" class="mdc-tab" href="#panel-2">By Component</a>
            <span class="mdc-tab-bar__indicator"></span>
          </nav>
        </section>
        <section>
          <div class="panels" ref="panels">
            <div class="panel active" id="panel-1" role="tabpanel" aria-hidden="false">
              <div class="table-header" v-if="Object.keys(kits).length > 0">
                <div class="table-header__summary">
                  <select-all :items="kitComponents" :selectedKey="'selected'" class="table-header__header"></select-all>
                  <span class="table-header__header">Kit label</span>
                  <span class="table-header__secondary-content">Status</span>
                </div>
              </div>
              <details class="mdc-expansion" v-for="items in kits" :key="items[0].kitLabel" v-if="items[0].kitLabel.includes(filterBy)">
                <summary class="mdc-expansion__summary">
                  <div>
                    <select-all :items="items" :selectedKey="'selected'" class="mdc-expansion__header"></select-all>
                    <span class="mdc-expansion__header">{{ items[0].kitLabel }}</span>
                    <span class="mdc-expansion__secondary-content">{{ items[0].kitStatus }}</span>
                  </div>
                </summary>
                <div class="mdc-expansion__content">
                  <table ref="componentsTables" class="mdl-data-table">
                    <tbody>
                      <tr v-for="item in items" @click.capture="item.selected = !item.selected">
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
            </div>
            <div class="panel" id="panel-2" role="tabpanel" aria-hidden="true">
              <div class="table-header" v-if="Object.keys(components).length > 0">
                <div class="table-header__summary">
                  <select-all :items="kitComponents" :selectedKey="'selected'" class="table-header__header"></select-all>
                  <span class="table-header__header">Component Type</span>
                </div>
              </div>
              <details class="mdc-expansion" v-for="items in components" :key="items[0].componentType" v-if="items[0].componentType.includes(filterBy)">
                <summary class="mdc-expansion__summary">
                  <div>
                    <select-all :items="items" :selectedKey="'selected'" class="mdc-expansion__header"></select-all>
                    <span class="mdc-expansion__header">{{ items[0].componentType }}</span>
                  </div>
                </summary>
                <div class="mdc-expansion__content">
                  <table ref="componentsTables" class="mdl-data-table">
                    <tbody>
                      <tr v-for="item in items" @click.capture="item.selected = !item.selected">
                        <td>
                          <mdc-checkbox v-model="item.selected" />
                        </td>
                        <td class="mdl-data-table__cell--non-numeric">{{ item.kitLabel }}</td>
                        <td>{{ item.kitStatus }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          </div>
        </section>
  
        <button id="print-selected" @click="printSelected" class="mdc-button mdc-button--accent mdc-button--raised">
          <span class="v-align-middle material-icons">print</span>
          <span>Print selected</span>
        </button>
        <snackbar event="notify"></snackbar>
        <mdc-dialog 
          title="Choose kit statuses to include in query"
          ref="statuses"
          :useDefaultFooter="false">
          <section class="mdc-dialog__body">
            <div class="two-columns">
              <div v-for="status in kitStatuses" class="mdc-form-field">
                <mdc-checkbox :id="'status-checkbox-'+status.id" :labelId="'status-checkbox-label-'+status.id" :value="status.id" v-model="selectedKitStatuses" />
                <label :id="'status-checkbox-label-'+status.id" :for="'status-checkbox-'+status.id">{{ status.label }}</label>
              </div>
            </div>
          </section>
          <footer class="mdc-dialog__footer">
            <button type="button" class="mdc-button mdc-dialog__footer__button" @click="() => { fetchKitComponents(); $refs.statuses.close(); }">
              Update
            </button>
          </footer>
        </mdc-dialog>
        <mdc-dialog id="print-dialog"
          title="Print selected labels via BarTender"
          ref="print"
          :useDefaultFooter="false">
          <section class="mdc-dialog__body">
            <template v-for="item in selectedItems">
              <template v-for="label in item.labels">
                <ul class="mdc-list mdc-list--two-line mdc-list--avatar-list">
                  <li class="mdc-list-divider" role="separator"></li>
                  <li class="mdc-list-item">
                    <span class="mdc-list-item__start-detail">
                      <select-all :items="label.selected" />
                    </span>
                    <span class="mdc-list-item__text">{{ item.componentType }}
                      <span class="mdc-list-item__text__secondary">{{ label.description || label.templateFile }}</span>
                    </span>
                  </li>
                </ul>
                <div class="mdc-layout-grid">
                  <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-1"></div>
                  <div class="mdc-layout-grid__cell" v-for="header in item.headers">{{ header }}</div>
                </div>
                <div class="mdc-layout-grid" v-for="(row,i) in item.values">
                  <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-1">
                    <mdc-checkbox class="center-flex-item" v-model="label.selected[i]" />
                  </div>
                  <div class="mdc-layout-grid__cell mdc-textfield mdc-textfield--fullwidth" v-for="value in row">
                    <input type="text" class="mdc-textfield__input" :value="value">
                  </div>
                </div>
                <br><br>
              </template>
            </template>
          </section>
          <footer class="mdc-dialog__footer">
            <button type="button" class="mdc-button mdc-dialog__footer__button"
                    @click="() => { $refs.print.close(); }">
              Cancel
            </button>
            <button type="button" class="mdc-button mdc-dialog__footer__button"
                    @click="">
              Print
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
import Snackbar from './components/Snackbar';
import mdcDialog from './components/Dialog';
import mdcCheckbox from './components/Checkbox';
import SelectAll from './components/SelectAll';
import {MDCTabBar, MDCTabFoundation} from '@material/tabs';

export default {
  name: 'app',
  components: { Toolbar, mdcSelect, Snackbar, mdcDialog, mdcCheckbox, SelectAll, MDCTabBar, MDCTabFoundation },
  data () {
    return {
      filterBy: '44',
      panels: [],
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
    },
    selectedItems () {
      return this.kitComponents.filter(item => item.selected);
    }
  },
  methods: {
    updatePanel () {
      var vm = this;
      var activePanel = document.querySelector('.panel.active');
      if (activePanel) {
        activePanel.classList.remove('active');
      }
      var newActivePanel = document.querySelector('.panel:nth-child(' + (vm.tabs.activeTabIndex + 1) + ')');
      if (newActivePanel) {
        newActivePanel.classList.add('active');
      }
    },
    fetchKitComponents (kitType) {
      if (kitType) this.selectedKitType = kitType;
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
              item.labels.forEach(label => { label.selected = item.values.map(() => true); });
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
      this.$refs.print.show();
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
    });
  },
  mounted () {
    // wire up MDC components
    MDCTextfield.attachTo(this.$refs.search);
    this.tabs = MDCTabBar.attachTo(this.$refs.tabs)
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
<style src="@material/button/mdc-button.scss" lang="scss"></style>
<style src="./assets/mdl/data-table/data-table.scss" lang="scss"></style>
<style src="@material/list/mdc-list.scss" lang="scss"></style>
<style src="@material/form-field/mdc-form-field.scss" lang="scss"></style>
<style src="@material/tabs/mdc-tabs.scss" lang="scss"></style>
<style src="./components/mdc-expansion.scss" lang="scss"></style>
<style src="@material/layout-grid/mdc-layout-grid.scss" lang="scss"></style>

<style lang="scss">
.v-align-middle {
  vertical-align: middle;
}

.material-icons {
  text-decoration: none;
  cursor: pointer;
}

/* A simple menu button. */
.toolbar-button {
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

@import "@material/elevation/mixins";

.mdl-data-table {
  @include mdc-elevation(2);

  thead {
    background-color: rgb(224,224,224);
    color: rgb(117,117,117);
    font-weight: 500;
  }
}

.mdc-expansion__content {
  .mdl-data-table {
    tbody {
        tr {
          td:first-child {
            width: 10%;
          }
          td:last-child {
            width: 20%;
          }
        }
      }
    width: 100%;
    margin-left: 12px;
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
    align-items: center;
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
}

.panels {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 8px;
}

.panel {
  display: none;
}

.panel.active {
  display: block;
}

</style>
