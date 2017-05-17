<template>
<div ref="root" class="mdc-select mdc-menu-anchor" 
  role="listbox"
  tabindex="0"
  :class="classes"
  @MDCSelect:change="onChange">
  <span class="mdc-select__selected-text">{{value}}</span>
  <div class="mdc-simple-menu mdc-select__menu"
      @MDCSimpleMenu:selected="onSelected">
    <ul class="mdc-list mdc-simple-menu__items">
      <slot
        v-for="option in options"
        :optionName="option.name"
        :optionValue="option.value">
      </slot>
    </ul>
  </div>
</div>
</template>

<script>
import {MDCSelect} from '@material/select'

export default {
  name: 'mdc-select',
  props: {
    id: String,
    options: {
      type: Array,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      classes: {},
      select: null
    };
  },
  mounted () {
    this.select = new MDCSelect(this.$refs.root);
  },
  updated () {
    this.select.foundation_.resize();
  },
  methods: {
    onChange () {
      this.$emit('input', this.select.value);
    },
    onSelected () {
      this.$emit('selected', this.select.value);
    }
  }
}
</script>

<style src="@material/select/mdc-select.scss" lang="scss"></style>
<style src="@material/menu/mdc-menu.scss" lang="scss"></style>
<style src="@material/list/mdc-list.scss" lang="scss"></style>
<style>

.mdc-select .mdc-simple-menu {
  overflow: scroll;
}
</style>
