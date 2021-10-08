<template lang="pug">
  v-footer(padless)
    v-col.text-center(cols="12")
      div(v-if="discordTag") Made with
        v-icon.mx-1(color="red" size="16px") mdi-heart
        | by
        v-tooltip(top @input="tooltipVisibilityChanged" min-width="180px" :color="copySuccess ? 'success' : copyError ? 'error' : undefined")
          template(v-slot:activator="{ on, attrs }")
            span(v-bind="attrs" v-on="on" style="cursor:pointer;" @click="copyDiscordTag") &nbsp;{{ discordTag }}
          div.text-center
            template(v-if="copySuccess") Copied to Clipboard
            template(v-else-if="copyError") Copy Failed
            template(v-else) Copy to Clipboard
        a.ml-1(href="https://github.com/zikeji/new-world-crafting-calculator" style="text-decoration: none;")
          v-icon(size="20px") mdi-github
      small &copy; {{ new Date().getFullYear() }} nwcraft.place. New World is a trademark of Amazon Game Studios. We are not affiliated with or endorsed by Amazon Game Studios.
</template>

<script>
export default {
  name: 'Footer',
  data: () => ({
    discordTag: process.env.VUE_APP_DISCORD_TAG,
    copySuccess: false,
    copyError: false
  }),
  methods: {
    tooltipVisibilityChanged(visible) {
      if (visible) return;
      if (this.copySuccess) this.copySuccess = false;
      if (this.copyError) this.copyError = false;
    },
    copyDiscordTag() {
      if (!navigator || !navigator.clipboard || !navigator.clipboard.writeText) {
        this.copyError = true;
        return;
      }
      navigator.clipboard.writeText(this.discordTag).then(() => {
        this.copySuccess = true;
      }).catch(() => {
        this.copyError = true;
      });
    }
  }
}
</script>