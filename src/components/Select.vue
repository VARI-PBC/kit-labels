<template>
<div ref="root" class="mdc-select mdc-menu-anchor" 
  role="listbox"
  tabindex="0"
  :class="classes"
  @MDCSelect:change="onChange">
  <span class="mdc-select__selected-text">{{selectedTextValue}}</span>
  <div class="mdc-simple-menu mdc-select__menu"
      @MDCSimpleMenu:selected="onSelected">
    <ul class="mdc-list mdc-simple-menu__items">
      <slot></slot>
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
    value: {
      type: [Number, String],
      required: true
    },
    unselectedText: String
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
      this.$emit('input', this.select.value, this.select.selectedIndex);
    },
    onSelected (event) {
      this.$emit('selected', event.detail.item.id);
    },
    item (index) {
      return this.select ? this.select.item(index) : null;
    },
    nameditem (key) {
      return this.select ? this.select.nameditem(key) : null;
    }
  },
  computed: {
    selectedTextValue () {
      let item = this.nameditem(this.value);
      return item ? item.textContent : this.unselectedText;
    }
  }
}
</script>

<style src="@material/select/mdc-select.scss" lang="scss"></style>
<style src="@material/menu/mdc-menu.scss" lang="scss"></style>
<style src="@material/list/mdc-list.scss" lang="scss"></style>
<style>

.mdc-select .mdc-simple-menu {
  overflow: auto;
}

.mdc-select {
  min-width: 125px;
}
</style>
