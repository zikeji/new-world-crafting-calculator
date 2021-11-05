<template lang="pug">
  v-app
    v-app-bar(
      app
      absolute
      dense
      hide-on-scroll
      :extension-height="$vuetify.breakpoint.xs ? 48 : 0"
      :color="$vuetify.theme.dark ? 'purple accent-4' : 'purple accent-1'"
      )
      v-app-bar-nav-icon.d-flex.d-sm-none(@click.stop="drawer = !drawer")
      v-avatar.d-none.d-sm-flex.mr-3(size="46px")
        img(alt="Logo" src="/android-chrome-192x192.png")
      v-toolbar-title New World Crafting Calculator
      v-spacer.d-none.d-sm-flex
      v-menu(bottom left offset-y)
        template(v-slot:activator="{ on, attrs }")
          v-btn.d-none.d-sm-flex.mr-2(outlined v-on="on" v-bind="attrs") Resources
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
          v-btn.d-none.d-sm-flex(icon v-bind="attrs" v-on="on" @click="$refs.feedback.show()")
            v-icon mdi-message
      v-tooltip(left)
        span(v-if="$vuetify.theme.dark") Set Light Mode
        span(v-else) Set Dark Mode
        template(v-slot:activator="{ on, attrs }")
          v-btn.d-none.d-sm-flex(icon v-bind="attrs" v-on="on" @click="toggleDarkMode")
            v-icon mdi-theme-light-dark
      template(v-slot:extension)
        portal-target(name="extendedAppBar" slim :disabled="!$vuetify.breakpoint.xs")
    v-navigation-drawer(v-model="drawer" absolute temporary)
      v-list(nav subheader)
        v-subheader External Resources
        v-list-item(href="https://newworldfans.com/")
          v-list-item-avatar
            v-img(src="/thirdparty/newworldfans-72x72.png")
          v-list-item-title New World Fans
        v-list-item(href="https://nwdb.info/")
          v-list-item-avatar(color="grey darken-4")
            v-img(src="/thirdparty/nwdb-42x42.png")
          v-list-item-title New World Database
      template(v-slot:append)
        .pa-2
          v-btn(block @click="$refs.feedback.show()")
            v-icon(left) mdi-message
            | Leave Feedback
          v-btn.mt-2(block @click="toggleDarkMode")
            v-icon(left) mdi-theme-light-dark
            template(v-if="$vuetify.theme.dark") Set Light Mode
            template(v-else) Set Dark Mode
    v-main
      v-container
        v-row
          v-col.pa-0.mt-n4.mt-sm-0(
            sm="10" offset-sm="1"
            md="8" offset-md="2"
            )
            Calculator
    Feedback(ref="feedback" :feedback-url="feedbackUrl")
    Footer

</template>

<script>
import Calculator from './components/Calculator.vue';
import Feedback from './components/Feedback.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  mounted() {
    if (localStorage && localStorage.dark === 'false') {
      this.$vuetify.theme.dark = false;
    }
  },
  components: {
    Calculator,
    Feedback,
    Footer
  },
  data: () => ({
    drawer: false,
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
};
</script>
