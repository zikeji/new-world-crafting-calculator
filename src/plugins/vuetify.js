import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: colors.purple.accent4,
        secondary: colors.purple.accent3
      },
      light: {
        primary: colors.purple.accent3,
        secondary: colors.purple.accent2
      }
    }
  }
});
