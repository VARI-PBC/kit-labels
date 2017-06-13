<template>
<div role="tabpanel" aria-hidden="false" class="panels">
  <div class="table-header">
    <div class="table-header__summary">
      <select-all :items="kitComponents" :selectedKey="'selected'" class="table-header__header"></select-all>
      <span class="table-header__header">Kit label</span>
      <span class="table-header__secondary-content">Status</span>
      <span class="table-header__interactive-content">
        <button class="table-header__button material-icons" @click="toggleDetails">swap_vert</button></span>
    </div>
  </div>
  <details class="mdc-expansion" ref="expansions" v-for="items in kits" :key="items[0].kitLabel" v-if="items[0].kitLabel.includes(filterBy)">
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
</template>

<script>
import mdcCheckbox from './components/Checkbox';
import SelectAll from './components/SelectAll';
import groupBy from 'lodash/groupBy';

export default {
  name: 'app-kit-groups',
  components: { mdcCheckbox, SelectAll },
  props: {
    kitComponents: {
      type: Array,
      required: true
    },
    filterBy: {
      type: String,
      required: true
    }
  },
  data () {
    return {}
  },
  computed: {
    kits () {
      return groupBy(this.kitComponents, 'kitLabel');
    }
  },
  methods: {
    toggleDetails () {
      let status = !this.$refs.expansions[0].open;
      this.$refs.expansions.forEach(e => { e.open = status; });
    }
  }
}
</script>
