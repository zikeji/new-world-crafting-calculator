<template lang="pug">
  v-tooltip(v-model="tooltip" :color="error ? 'error' : 'success'" top)
    template(v-slot:activator="{}")
      slot(v-bind:click="copyToClipboard")
    span(v-if="error") Copy Failed
    span(v-else) Copied to Clipboard
</template>

<script>
export default {
  name: 'CopyToClipboard',
  props: {
    value: String
  },
  model: {
    prop: 'value'
  },
  data: () => ({
    tooltip: false,
    error: false
  }),
  methods: {
    copyToClipboard() {
      if (this.tooltip || this.error) return;
      if (!navigator || !navigator.clipboard || !navigator.clipboard.writeText) {
      this.error = true;
      this.tooltip = true;
        return;
      }
      navigator.clipboard.writeText(this.value).then(() => {
        this.error = false;
        this.tooltip = true;
      }).catch(() => {
        this.error = true;
        this.tooltip = true;
      });

      setTimeout(() => {
        this.tooltip = false;
      }, 2000);
    }
  }
}
</script>