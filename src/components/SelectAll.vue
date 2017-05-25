<template>
    <mdc-checkbox v-model="selectAllItems" :indeterminate="setIndeterminate"></mdc-checkbox>
</template>

<script>
import mdcCheckbox from './Checkbox'

export default {
  name: 'select-all',
  components: { mdcCheckbox },
  props: {
    items: {
      type: Array,
      required: true
    },
    selectedKey: String
  },
  computed: {
    selectAllItems: {
      get () {
        var vm = this;
        return vm.items.length > 0 &&
          vm.items.every(item => vm.selectedKey ? item[vm.selectedKey] : item);
      },
      set (value) {
        var vm = this;
        vm.items.forEach(function (item, index) {
          if (vm.selectedKey) {
            item[vm.selectedKey] = value;
          } else {
            vm.$set(vm.items, index, value);
          }
        });
      }
    },
    setIndeterminate () {
      var vm = this;
      return vm.items.length > 0 &&
       vm.items.some(item => vm.selectedKey ? item[vm.selectedKey] : item) &&
       !vm.items.every(item => vm.selectedKey ? item[vm.selectedKey] : item);
    }
  }
}
</script>
