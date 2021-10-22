<template lang="pug">
  v-card.mx-auto.mt-5
    v-card-text
      .d-flex.flex-row.align-stretch
        v-autocomplete.mr-2(v-model="selected" filled :items="Object.entries(availableItems).map(i => ({ ...i[1], id: i[0] })).sort((a, b) => a.name === b.name ? 0 : a.name < b.name ? -1 : 1)" label="Resource" item-text="name" item-value="id" hide-details @input="$refs.qty.focus()" return-object)
        v-text-field.mr-2(v-model="quantity" ref="qty" filled type="number" label="Quantity" hide-details)
        div
          v-btn.align-self-stretch(color="primary" height="100%" :disabled="!selected || !quantity" @click="add") Add
            v-icon(right) mdi-plus
    v-divider(v-if="items.length > 0")
    template(v-for="{item, quantity, options}, index in items")
      v-hover(v-slot:default="{ hover }")
        v-list-item(:key="item" style="min-height: 60px;")
          v-list-item-content
            v-list-item-title
              v-menu(eager disable-keys :close-on-content-click="false")
                template(v-slot:activator="{ on, attrs }")
                  span.text-h5.font-weight-bold(v-bind="attrs" v-on="on") {{ quantity }}x&nbsp;
                v-card.pb-1
                  v-text-field(:value="quantity" autofocus filled dense type="number" hide-details @input="updateQuantity(item, $event)" style="width: 100px;")
              a.text-h6.font-weight-bold.text-decoration-none(:href="`https://nwdb.info/db/item/${item}`" :class="[availableItems[item].rarity ? `rarity-${availableItems[item].rarity}`: $vuetify.theme.dark ? 'white--text' : 'black--text']" target="_blank") {{ availableItems[item].name }}
            v-list-item-subtitle.wrap-text(v-if="availableItems[item].raw")
              template(v-for="[rawItem, rawQuantity], index in availableItems[item].raw")
                template(v-if="index !== 0") ,&nbsp;
                template(v-if="availableItems[item].raw.length > 1 && index === (availableItems[item].raw.length - 1)") &amp;&nbsp;
                | {{ rawQuantity * quantity }}&nbsp;
                a.font-weight-bold.text-decoration-none(v-if="!availableItems[rawItem].options" :href="`https://nwdb.info/db/item/${rawItem}`" :class="availableItems[rawItem].rarity ? `rarity-${availableItems[rawItem].rarity}`: $vuetify.theme.dark ? 'grey--text text--lighten-2' : 'grey--text text--darken-2'" target="_blank") {{ availableItems[rawItem].name }}
                template(v-else)
                  a.font-weight-bold.text-decoration-none(:href="`https://nwdb.info/db/item/${getOption(rawItem, options)}`" :class="getOption(rawItem, options, true).rarity ? `rarity-${getOption(rawItem, options, true).rarity}`: $vuetify.theme.dark ? 'grey--text text--lighten-2' : 'grey--text text--darken-2'" target="_blank")
                    | {{ getOption(rawItem, options, true).name }}
                  v-menu(offset-y open-on-hover :open-on-click="false")
                    template(v-slot:activator="{ on, attrs }")
                      v-icon.ml-1(small v-on="on" v-bind="attrs") mdi-square-edit-outline
                    v-list(dense)
                      v-list-item(v-for="optionName in availableItems[rawItem].options" :key="optionName" @click="updateOption(item, rawItem, optionName)")
                        v-list-item-title(:class="availableItems[optionName].rarity ? `rarity-${availableItems[optionName].rarity}`: null") {{ availableItems[optionName].name }}
          v-list-item-action
            v-fade-transition
              v-btn.ma-0(v-show="hover" icon @click="remove(item)")
                v-icon(color="error") mdi-delete
    v-card-actions
      v-spacer
      v-btn.mr-2(v-if="recipeUrl" @click="$refs.nwdbImport.show()") NWDB Import
        v-icon(right) mdi-import
      CopyToClipboard(v-model="url")
        template(v-slot="{ click }")
          v-btn(@click="click" :disabled="items.length === 0") Copy Link
            v-icon(right) mdi-content-copy
      v-btn(color="primary" @click="$refs.billOfMaterials.show()" :disabled="items.length === 0") View BOM
        v-icon(right) mdi-list-status
    BillOfMaterials(ref="billOfMaterials" :url="url" :items="items")
    NWDBImport(ref="nwdbImport" :recipe-url="recipeUrl" @imported="importRecipe")
</template>

<script>
import { pack, unpack } from 'jsonc-compress';
import CopyToClipboard from './CopyToClipboard.vue';
import BillOfMaterials from './Calculator/BillOfMaterials.vue';
import NWDBImport from './Calculator/NWDBImport.vue';
import availableItems from '../assets/data.json';

export default {
  name: 'Calculator',
  components: {
    CopyToClipboard,
    BillOfMaterials,
    NWDBImport
  },
  mounted() {
    this.loadFromUrl()
  },
  data: () => ({
    selected: null,
    quantity: null,
    availableItems,
    items: [],
    recipeUrl: process.env.VUE_APP_NWDB_RECIPEURL
  }),
  computed: {
    url() {
      const params = new URLSearchParams(window.location.search);
      const newURL = new URL(window.location.href);
      if (this.items.length > 0) {
        const p = [];
        for (const item of this.items) {
          const d = [item.item, item.quantity];
          if (item.options && Object.keys(item.options).length > 0) {
            d.push(item.options);
          }
          p.push(d)
        }
        params.set('s', pack(p));
      } else {
        params.delete('s');
      }
      newURL.search = params.toString();
      return newURL.href;
    }
  },
  methods: {
    loadFromUrl() {
      const params = new URLSearchParams(window.location.search);
      if (params.get('s')) {
        try {
          for (const [item, quantity, options] of unpack(params.get('s'))) {
            if (item in this.availableItems) {
              this.items.push({
                item,
                quantity,
                options: options || {}
              });
            }
          }
        } catch (e) {
          // noop
        }
      }
    },
    updateUrl() {
      if (window.history && window.history.replaceState && this.url !== window.location.href) {
        window.history.replaceState(null, null, this.url);
      }
    },
    add() {
      const currentIndex = this.items.findIndex(c => c.item === this.selected.id);
      if (currentIndex > -1) {
        this.items[currentIndex].quantity += parseInt(this.quantity);
      } else {
        this.items.push({
          quantity: parseInt(this.quantity),
          item: this.selected.id,
          options: {}
        });
      }
      this.selected = null;
      this.quantity = null;
      this.updateUrl();
    },
    updateQuantity(item, quantity) {
      const currentIndex = this.items.findIndex(c => c.item === item);
      if (currentIndex > -1) {
        const newItem = JSON.parse(JSON.stringify(this.items[currentIndex]));
        newItem.quantity = quantity > 0 ? quantity : 1;
        this.$set(this.items, currentIndex, newItem);
      }
      this.updateUrl();
    },
    updateOption(parentItem, item, option) {
      const currentIndex = this.items.findIndex(c => c.item === parentItem);
      if (currentIndex > -1) {
        const newItem = JSON.parse(JSON.stringify(this.items[currentIndex]));
        if (!newItem.options) newItem.options = {};
        newItem.options[item] = option;
        this.$set(this.items, currentIndex, newItem);
        this.updateUrl();
      }
    },
    remove(item) {
      const currentIndex = this.items.findIndex(c => c.item === item);
      if (currentIndex > -1) {
        this.items.splice(currentIndex, 1);
        this.updateUrl();
      }
    },
    getOption(item, options, obj) {
      const id = options && item in options ? options[item] : availableItems[item].options[0];
      return obj ? this.availableItems[id] : id;
    },
    importRecipe(items) {
      for (const {item, quantity} of items) {
        const currentIndex = this.items.findIndex(c => c.item === item);
        if (currentIndex > -1) {
          this.items[currentIndex].quantity += quantity;
        } else {
          this.items.push({
            item,
            quantity
          });
        }
      }
      this.updateUrl();
    }
  }
}
</script>