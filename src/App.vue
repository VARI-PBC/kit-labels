<template>
  <body id="app" class="mdc-typography">
    <!-- Header -->
    <toolbar>
      <span slot="section-start" class="mdc-toolbar__title catalog-title">Kit labels</span>
      <mdc-select slot="section-end" class="mdc-theme--text-primary-on-dark"
        v-model="selectedKitType"
        unselectedText="Select kit type"
        @selected="fetchKitComponents"
        :options="kitTypes">
        <li class="mdc-list-item" role="option" :id="kitType.value" tabindex="0"
          v-for="kitType in kitTypes">
          {{kitType.name}}
        </li>
      </mdc-select>
      <label slot="section-end" ref="search" class="mdc-textfield search-box">
        <input type="text" class="mdc-textfield__input mdc-theme--text-primary-on-dark" v-model="filterBy">
        <span class="mdc-textfield__label mdc-theme--text-secondary-on-dark">Search kits</span>
      </label>
      <button slot="section-end" class="toolbar-button material-icons" @click="$refs.options.show()">settings</button>
    </toolbar>
    <!-- Main content -->
    <main class="main mdc-toolbar-fixed-adjust">
      <section id="tab-nav">
        <nav ref="tabs" id="tab-bar" class="mdc-tab-bar mdc-tab-bar--indicator-accent" role="tablist">
          <a role="tab" aria-controls="By kit" class="mdc-tab" id="kit">By Kit</a>
          <a role="tab" aria-controls="By component" class="mdc-tab" id="component">By Component</a>
          <span class="mdc-tab-bar__indicator"></span>
        </nav>
      </section>
      <section>
        <transition appear name="component-fade" mode="out-in">
          <keep-alive>
            <component :is="currentView"
              :kitComponents="kitComponents"
              :filterBy="filterBy"
              :loading="loading"></component>
          </keep-alive>
        </transition>
      </section>
      <button id="print-selected" @click="$refs.print.show()" class="mdc-button mdc-button--accent mdc-button--raised">
        <span class="v-align-middle material-icons">print</span>
        <span>Print selected</span>
      </button>
      <snackbar event="notify"></snackbar>
      <app-dialog-options
        ref="options"
        :kitStatuses="kitStatuses"
        @updateKitStatuses="updateKitStatuses">
      </app-dialog-options>
      <app-dialog-print ref="print" :kitComponents="kitComponents">
      </app-dialog-print>
    </main>
  </body>
</template>

<script>
import Toolbar from './components/Toolbar';
import mdcSelect from './components/Select';
import {MDCTextfield} from '@material/textfield';
import Snackbar from './components/Snackbar';
import mdcDialog from './components/Dialog';
import {MDCTabBar} from '@material/tabs';
import appDialogPrint from './AppDialogPrint';
import appDialogOptions from './AppDialogOptions';
import appViewKitFirst from './AppViewKitFirst';
import appViewComponentFirst from './appViewComponentFirst';

export default {
  name: 'app',
  components: {
    Toolbar,
    mdcSelect,
    Snackbar,
    mdcDialog,
    MDCTabBar,
    appDialogPrint,
    appDialogOptions
  },
  data () {
    return {
      kitTypes: [],
      selectedKitType: '',
      filterBy: '',
      kitStatuses: [],
      selectedKitStatuses: localStorage.getItem('SelectedStatuses') ? JSON.parse(localStorage.getItem('SelectedStatuses')) : [6],
      tabBar: null,
      kitComponents: [],
      loading: false
    }
  },
  computed: {
    currentView () {
      if (!this.selectedKitType) {
        return null;
      }
      var tabId = this.tabBar && this.tabBar.activeTab
        ? this.tabBar.activeTab.root_.id
        : localStorage.getItem('DefaultTab');

      switch (tabId) {
        case 'kit':
        default:
          return appViewKitFirst;
        case 'component':
          return appViewComponentFirst;
      }
    }
  },
  methods: {
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
          response.json().then(kitComponents => {
            vm.kitComponents = kitComponents.map(item => Object.assign(item, { selected: false }));
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
    updateKitStatuses (kitStatuses, refresh) {
      this.selectedKitStatuses = kitStatuses;
      if (refresh) {
        this.fetchKitComponents();
      }
      localStorage.setItem('SelectedStatuses', JSON.stringify(kitStatuses));
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
    this.tabBar = MDCTabBar.attachTo(this.$refs.tabs);
    let defaultTabId = localStorage.getItem('DefaultTab');
    let defaultTab = this.tabBar.tabs.find(tab => tab.root_.id === defaultTabId);
    this.tabBar.activeTab = defaultTab || this.tabBar.tabs[0];
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
<style src="@material/tabs/mdc-tabs.scss" lang="scss"></style>
<style src="./components/mdc-expansion.scss" lang="scss"></style>
<style src="@material/linear-progress/mdc-linear-progress.scss" lang="scss"></style>

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

.main {
  margin-left: auto;
  margin-right: auto;
  width: intrinsic;
}

.mdc-textfield.search-box {
  margin: 0 16px !important;
  height: 32px !important;
}

#print-selected {
  position: fixed;
  display: block;
  right: 0;
  bottom: 0;
  margin-right: 40px;
  margin-bottom: 40px;
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
    flex-basis: 53%;
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
    flex-basis: 35%;
    color: rgba(0, 0, 0, .45);
    margin-right: 16px;
  }

  &__interactive-content {
    display: flex;
    flex-direction: column;
    justify-content: right;
    font-size: 1.0625rem;
    font-weight: 700;
    flex-basis: 0%;
    color: rgba(0, 0, 0, .45);
  }

  &__button {
    justify-content: right;
    background: none;
    border: none;
    width: 24px;
    height: 24px;
    padding: 0;
    margin: 0;
    color: rgba(0, 0, 0, .45);
    box-sizing: border-box;
  }
}

.panels {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 8px;
}

.component-fade-enter-active, .component-fade-leave-active {
  transition: opacity .3s ease;
}
.component-fade-enter, .component-fade-leave-to
/* .component-fade-leave-active for <2.1.8 */ {
  opacity: 0;
}
</style>
