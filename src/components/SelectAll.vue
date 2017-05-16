<template>
    <mdc-checkbox v-model="selectAllItems"></mdc-checkbox>
</template>

<script>
import mdcCheckbox from './Checkbox'

export default {
  name: 'select-all',
  components: { mdcCheckbox },
  props: {
    items: Array,
    selectedKey: String
  },
  computed: {
    selectAllItems: {
      get () {
        var vm = this;
        return vm.items.length > 0 &&
          vm.items.every(item => item[vm.selectedKey] === true);
      },
      set (value) {
        var vm = this;
        vm.items.forEach(function (item) {
          item[vm.selectedKey] = value;
        });
      }
    }
  }
}
</script>
