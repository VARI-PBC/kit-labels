<template>
  <header class="mdc-toolbar mdc-toolbar--fixed">
    <div class="mdc-toolbar__row">
      <section class="mdc-toolbar__section mdc-toolbar__section--align-start">
        <span class="mdc-toolbar__title">{{ title }}</span>
        <slot name="section-start"></slot>
      </section>
      <section class="mdc-toolbar__section mdc-toolbar__section--align-end" role="toolbar">
        <slot name="section-end"></slot>
      </section>
    </div>
  </header>
</template>

<script>
export default {
  name: 'toolbar',
  props: {
    title: String
  }
}
</script>

<style src="@material/toolbar/mdc-toolbar.scss" lang="scss"></style>
<style>
.mdc-toolbar__row {
  padding: 20px 28px;
}

.mdc-toolbar__section {
  overflow: visible;
}

</style>
