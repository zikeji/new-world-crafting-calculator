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
    v-menu(bottom left offset-y)
      template(v-slot:activator="{ on, attrs }")
        v-btn.mr-2(outlined v-on="on" v-bind="attrs") Resources
          v-icon(right) mdi-link
      v-list
        v-list-item(href="https://newworldfans.com/")
          v-list-item-avatar
            v-img(src="/thirdparty/newworldfans-72x72.png")
          v-list-item-title New World Fans
        v-list-item(href="https://nwdb.info/")
          v-list-item-avatar(color="grey darken-4")
            v-img(src="/thirdparty/nwdb-42x42.png")
          v-list-item-title New World Database
    v-tooltip(v-if="feedbackUrl" left)
      span Leave Feedback
      template(v-slot:activator="{ on, attrs }")
        v-btn(icon v-bind="attrs" v-on="on" @click="$refs.feedback.show()")
          v-icon mdi-message
    v-tooltip(left)
      span(v-if="$vuetify.theme.dark") Set Light Mode
      span(v-else) Set Dark Mode
      template(v-slot:activator="{ on, attrs }")
        v-btn(icon v-bind="attrs" v-on="on" @click="toggleDarkMode")
          v-icon mdi-theme-light-dark
    Feedback(ref="feedback" :feedback-url="feedbackUrl")
</template>

<script>
import Feedback from './Feedback.vue';

export default {
  name: 'AppBar',
  components: {
    Feedback
  },
  data: () => ({
    feedbackUrl: process.env.VUE_APP_FEEDBACKURL
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