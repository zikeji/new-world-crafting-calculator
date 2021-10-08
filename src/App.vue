<template lang="pug">
  v-app
    AppBar
    v-main
      v-container
        v-row
          v-col(
            sm="10" offset-sm="1"
            md="8" offset-md="2"
            )
            Calculator
    Footer

</template>

<script>
import AppBar from './components/AppBar.vue';
import Footer from './components/Footer.vue';
import Calculator from './components/Calculator.vue';

export default {
  name: 'App',
  mounted() {
    if (localStorage && localStorage.dark === 'false') {
      this.$vuetify.theme.dark = false;
    }
  },
  components: {
    AppBar,
    Footer,
    Calculator
  }
};
</script>
