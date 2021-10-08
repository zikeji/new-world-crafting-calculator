<template lang="pug">
  v-app-bar(
    app
    dense
    hide-on-scroll
    :color="$vuetify.theme.dark ? 'purple accent-4' : 'purple accent-1'"
    )
    v-avatar.mr-3(size="46px")
      img(alt="Logo" src="/android-chrome-192x192.png")
    v-toolbar-title New World Crafting Calculator
    v-spacer
    v-btn.mr-2(outlined href="https://newworldfans.com/")
      v-icon mdi-link
      | newworldfans.com
    v-tooltip(left)
      span(v-if="$vuetify.theme.dark") Set Light Mode
      span(v-else) Set Dark Mode
      template(v-slot:activator="{ on, attrs }")
        v-btn(icon v-bind="attrs" v-on="on" @click="toggleDarkMode")
          v-icon mdi-theme-light-dark
</template>

<script>
export default {
  name: 'AppBar',
  data: () => ({
  }),
  methods: {
    toggleDarkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      if (localStorage) {
        localStorage.dark = this.$vuetify.theme.dark;
      }
    }
  }
}
</script>