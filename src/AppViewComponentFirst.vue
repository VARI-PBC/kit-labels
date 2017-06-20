<template>
<div role="tabpanel" aria-hidden="true" class="panels">
  <div class="table-header">
    <div class="table-header__summary">
      <select-all :items="filteredComponents" :selectedKey="'selected'" class="table-header__header"></select-all>
      <span class="table-header__header">Component Type</span>
      <span class="table-header__secondary-content"></span>
      <span class="table-header__interactive-content">
        <button class="table-header__button material-icons" @click="toggleDetails">swap_vert</button>
      </span>
    </div>
    <div role="progressbar" class="mdc-linear-progress mdc-linear-progress--indeterminate" :class="{ 'mdc-linear-progress--closed': !loading }">
      <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
        <span class="mdc-linear-progress__bar-inner"></span>
      </div>
      <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
        <span class="mdc-linear-progress__bar-inner"></span>
      </div>
    </div>
  </div>
  <details class="mdc-expansion" ref="component_expansions" v-for="items in components" :key="items[0].componentType" :open="open">
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
            <td class="mdl-data-table__cell--non-numeric">{{ item.kitStatus }}</td>
            <td>{{ item.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</div>
</template>

<script>
import mdcCheckbox from './components/Checkbox';
import SelectAll from './components/SelectAll';
import groupBy from 'lodash/groupBy';

export default {
  name: 'app-component-groups',
  components: { mdcCheckbox, SelectAll },
  props: {
    kitComponents: {
      type: Array,
      required: true
    },
    filterBy: {
      type: String,
      required: true
    },
    loading: Boolean,
    open: {
      type: Boolean,
      default: localStorage.getItem('DefaultExpansion') ? localStorage.getItem('DefaultExpansion') === 'expand' : false
    }
  },
  data () {
    return { }
  },
  computed: {
    filteredComponents () {
      let vm = this;
      function filterComponents (kitComponent) {
        return kitComponent.componentType.includes(vm.filterBy)
      }

      return this.kitComponents.filter(filterComponents)
    },
    components () {
      return groupBy(this.filteredComponents, 'componentType');
    }
  },
  methods: {
    toggleDetails () {
      let status = !this.$refs.component_expansions[0].open;
      this.$refs.component_expansions.forEach(e => { e.open = status; });
    }
  }
}
</script>
