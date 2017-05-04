<template>
    <checkbox v-model="selectAllItems">
    </checkbox>
</template>

<script>
import Checkbox from './Checkbox'

export default {
  name: 'select-all',
  components: {
    Checkbox
  },
  props: {
    items: Array
  },
  computed: {
    selectAllItems: {
      get () {
        return this.items.length > 0 &&
          this.items.every(item => item.selected === true);
      },
      set (value) {
        this.items.forEach(function (item) {
          item.selected = value;
        });
      }
    }
  }
}
</script>
