<template>
<aside id="my-mdc-dialog"
  ref="root"
  class="mdc-dialog"
  role="alertdialog"
  aria-labelledby="my-mdc-dialog-label"
  :aria-describedby="ariaDescription">
  <div class="mdc-dialog__surface">
    <header class="mdc-dialog__header">
      <h2 id="my-mdc-dialog-label" class="mdc-dialog__header__title">
        {{ title }}
      </h2>
    </header>
    <section class="mdc-dialog__body">
      <slot></slot>
    </section>
    <slot name="footer">
    <footer class="mdc-dialog__footer">
      <button type="button"
              class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--cancel"
              @click="$emit('cancel')">Cancel</button>
      <button type="button"
              class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept"
              @click="$emit('accept')">Accept</button>
    </footer>
    </slot>
  </div>
  <div class="mdc-dialog__backdrop"></div>
</aside>
</template>

<script>
import {MDCDialog} from '@material/dialog';

export default {
  name: 'mdc-dialog',
  props: {
    title: String,
    ariaDescription: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      dialog: null
    }
  },
  mounted () {
    // wire up MDC components
    this.dialog = new MDCDialog(this.$refs.root);
  },
  methods: {
    show () {
      this.dialog.show();
    },
    close () {
      this.dialog.close();
    }
  }
}
</script>

<style src="@material/dialog/mdc-dialog.scss" lang="scss"></style>
<style src="@material/button/mdc-button.scss" lang="scss"></style>
