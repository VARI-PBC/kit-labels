<template>
<mdc-dialog ref="root" @cancel="updateKitStatuses(false)">
  <section id="tab-nav">
    <nav ref="optionstabs" id="options-tab-bar" class="mdc-tab-bar mdc-tab-bar--indicator-accent" role="tablist">
      <a role="tab" aria-controls="Statuses" class="mdc-tab" :class="{ 'mdc-tab--active': activeOptionsTab === 'STATUSES' }">Statuses</a>
      <a role="tab" aria-controls="Default View" class="mdc-tab" :class="{ 'mdc-tab--active': activeOptionsTab === 'DEFAULT TAB' }">Default View</a>
      <a role="tab" aria-controls="Default Expansion" class="mdc-tab" :class="{ 'mdc-tab--active': activeOptionsTab === 'DEFAULT EXPANSION' }">Default Expansion</a>
      <span class="mdc-tab-bar__indicator"></span>
    </nav>
  </section>
  <section>
    <div class="panels" ref="optionspanels">
      <div class="panel" :class="{ active: activeOptionsTab === 'STATUSES' }" id="options-panel-1" role="tabpanel" aria-hidden="false">
        <div class="two-columns">
          <div v-for="status in kitStatuses" class="mdc-form-field">
            <mdc-checkbox :id="'status-checkbox-'+status.id" :labelId="'status-checkbox-label-'+status.id" :value="status.id" v-model="selectedKitStatuses" />
            <label :id="'status-checkbox-label-'+status.id" :for="'status-checkbox-'+status.id">{{ status.label }}</label>
          </div>
        </div>
      </div>
      <div class="panel" :class="{ active: activeOptionsTab === 'DEFAULT VIEW' }" id="options-panel-2" role="tabpanel" aria-hidden="false">
        <mdc-select class="mdc-theme--text-primary"
          v-model="selectedDefaultTab"
          unselectedText="Select default tab"
          @input="updateDefaultTab">
          <li class="mdc-list-item" role="option" id="kit" tabindex="0">
            By kit
          </li>
          <li class="mdc-list-item" role="option" id="component" tabindex="0">
            By component
          </li>
        </mdc-select>
      </div>
      <div class="panel" :class="{ active: activeOptionsTab === 'DEFAULT EXPANSION' }" id="options-panel-3" role="tabpanel" aria-hidden="false">
        <mdc-select class="mdc-theme--text-primary"
          v-model="selectedDefaultExpansion"
          unselectedText="Select default expansion"
          @input="updateDefaultExpansion">
          <li class="mdc-list-item" role="option" id="collapse" tabindex="0">
            Collapsed
          </li>
          <li class="mdc-list-item" role="option" id="expand" tabindex="0">
            Expanded
          </li>
        </mdc-select>
      </div>
    </div>
  </section>
  <footer class="mdc-dialog__footer" slot="footer">
    <button type="button" class="mdc-button mdc-dialog__footer__button" @click="updateKitStatuses(true)">
      Update
    </button>
  </footer>
</mdc-dialog>
</template>

<script>
import mdcDialog from './components/Dialog';
import mdcCheckbox from './components/Checkbox';
import {MDCTabBar} from '@material/tabs';
import mdcSelect from './components/Select';

export default {
  name: 'app-dialog-options',
  components: { mdcDialog, mdcCheckbox, MDCTabBar, mdcSelect },
  props: {
    kitStatuses: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      selectedKitStatuses: localStorage.getItem('SelectedStatuses') ? JSON.parse(localStorage.getItem('SelectedStatuses')) : [6],
      selectedDefaultTab: localStorage.getItem('DefaultTab') ? localStorage.getItem('DefaultTab') : 'kit',
      selectedDefaultExpansion: localStorage.getItem('DefaultExpansion') ? localStorage.getItem('DefaultExpansion') : 'collapse',
      optionsTabBar: null
    }
  },
  computed: {
    activeOptionsTab () {
      return this.optionsTabBar && this.optionsTabBar.activeTab ? this.optionsTabBar.activeTab.root_.getAttribute('aria-controls').toUpperCase() : 'STATUSES';
    }
  },
  methods: {
    show () {
      this.$refs.root.show();
    },
    updateDefaultTab (value) {
      localStorage.setItem('DefaultTab', value);
    },
    updateDefaultExpansion (value) {
      localStorage.setItem('DefaultExpansion', value);
    },
    updateKitStatuses (refresh = true) {
      this.$emit('updateKitStatuses', this.selectedKitStatuses, refresh);
      this.$refs.root.close();
    }
  },
  mounted () {
    this.optionsTabBar = MDCTabBar.attachTo(this.$refs.optionstabs);
  }
}
</script>

<style src="@material/typography/mdc-typography.scss" lang="scss"></style>
<style src="@material/form-field/mdc-form-field.scss" lang="scss"></style>
<style src="@material/tabs/mdc-tabs.scss" lang="scss"></style>
<style src="@material/button/mdc-button.scss" lang="scss"></style>

<style lang="scss">
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

.panel {
  display: none;
}

.panel.active {
  display: block;
  min-height: 200px;
}

</style>
