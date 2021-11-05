import Vue from 'vue';
import PortalVue from 'portal-vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import matomo from './plugins/matomo';
import './styles/index.scss';

Vue.use(PortalVue);

matomo();

Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app');
