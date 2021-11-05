<template lang="pug">
  v-card.mx-auto.mt-5
    v-card-text.d-none.d-sm-block
      .d-flex.flex-row.align-stretch
        v-autocomplete.mr-2(v-model="selected" ref="resource" :search-input.sync="search" filled :items="Object.entries(availableItems).map(i => ({ ...i[1], id: i[0] })).sort((a, b) => a.name === b.name ? 0 : a.name < b.name ? -1 : 1)" label="Resource" item-text="name" item-value="id" hide-details @input="$refs.resource.blur(); $refs.qty.focus()" return-object)
          template(v-slot:item="{ item }")
            v-list-item-content
              v-list-item-title(:class="item.rarity ? `rarity-${item.rarity}` : null") {{ item.name }}
        v-text-field.mr-2(v-model="quantity" ref="qty" filled type="number" label="Quantity" hide-details @keydown.enter="add" style="width: 50px;")
        div
          v-btn.align-self-stretch(color="primary" height="100%" :disabled="!selected || !quantity" @click="add") Add
            v-icon(right) mdi-plus
    v-divider.d-none.d-sm-flex(v-if="items.length > 0")
    draggable(v-model="items" handle=".handle" :class="dragging ? 'drag-active' : ''" @start="dragging = true" @end="dragging = false")
      transition-group
        template(v-for="{item, quantity, options}, index in items")
          v-list-item.resource(:key="item")
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
                div.actions
                  .d-flex.justify-end
                    v-tooltip(top nudge-left="20px")
                      template(v-slot:activator="{ on, attrs }")
                        v-edit-dialog(large save-text="Remove" @save="updateQuantity(item, quantity - quantityToRemove[item])" @close="closeRemoveQuantity(item)")
                          template(v-slot:input)
                            v-text-field(v-model="quantityToRemove[item]" type="number" placeholder="Quantity To Remove" autofocus single-line hide-details)
                          v-btn.ma-0.mr-1(icon v-on="on" v-bind="attrs")
                            v-icon mdi-minus
                      span Remove quantity
                    v-tooltip(top)
                      template(v-slot:activator="{ on, attrs }")
                        v-btn.ma-0.mr-2(icon v-on="on" v-bind="attrs" @click="remove(item)")
                          v-icon(color="error") mdi-delete
                      span Remove resource
                    v-icon.handle.ma-0 mdi-drag-horizontal
    v-card-actions.d-none.d-sm-flex
      v-spacer
      v-btn.mr-2(@click="$refs.recipeImport.show()") Import Recipe
        v-icon(right) mdi-import
      CopyToClipboard(v-model="url")
        template(v-slot="{ click }")
          v-btn(@click="click" :disabled="items.length === 0") Copy Link
            v-icon(right) mdi-content-copy
      v-btn(color="primary" @click="$refs.billOfMaterials.show()" :disabled="items.length === 0") View BOM
        v-icon(right) mdi-list-status
    portal(to="extendedAppBar")
      v-speed-dial.d-flex.d-sm-none(v-model="fab" direction="bottom" absolute right style="bottom: -16px;")
        template(v-slot:activator)
          v-btn(v-model="fab" color="secondary" fab)
            v-icon(v-if="fab") mdi-close
            v-icon(v-else) mdi-dots-vertical
        v-btn(fab small color="secondary" @click="resourceDialog = true")
          v-icon mdi-plus
        v-btn(fab small color="secondary" @click="$refs.recipeImport.show()")
          v-icon mdi-import
        v-btn(fab small color="secondary" :disabled="items.length === 0" @click="")
          v-icon mdi-content-copy
        v-btn(fab small color="secondary" :disabled="items.length === 0" @click="$refs.billOfMaterials.show()")
          v-icon mdi-list-status
    v-dialog(v-model="resourceDialog" max-width="600px")
      v-card
        v-card-title Add Resource
        v-divider
        v-card-text
          .d-flex.flex-column.mt-5
            v-autocomplete(v-model="selected" ref="mobileResource" :search-input.sync="mobileSearch" filled :items="Object.entries(availableItems).map(i => ({ ...i[1], id: i[0] })).sort((a, b) => a.name === b.name ? 0 : a.name < b.name ? -1 : 1)" label="Resource" item-text="name" item-value="id" hide-details @input="$refs.mobileResource.blur(); $refs.mobileQty.focus()" return-object)
              template(v-slot:item="{ item }")
                v-list-item-content
                  v-list-item-title(:class="item.rarity ? `rarity-${item.rarity}` : null") {{ item.name }}
            v-text-field.mt-3(v-model="quantity" ref="mobileQty" filled type="number" label="Quantity" hide-details @keydown.enter="add")
        v-card-actions
          v-spacer
          v-btn(@click="resourceDialog = false") Close
          v-btn(color="primary" @click="add" :disabled="!selected || !quantity") Add
            v-icon(right) mdi-plus
    RecipeImport(ref="recipeImport" @imported="importRecipe")
    BillOfMaterials(ref="billOfMaterials" :url="url" :items="items")
</template>

<style scoped>
.handle {
  cursor: pointer;
}
.resource {
  min-height: 60px;
}
@media (min-width: 600px) {
  .resource .actions {
    opacity: 0;
    transition: opacity 200ms ease-in-out;
  }
  .resource:hover .actions {
    opacity: 1;
  }
  .drag-active .resource .actions {
    opacity: 0;
  }
}
</style>

<script>
import { pack, unpack } from 'jsonc-compress';
import draggable from 'vuedraggable';
import CopyToClipboard from './CopyToClipboard.vue';
import BillOfMaterials from './Calculator/BillOfMaterials.vue';
import RecipeImport from './Calculator/RecipeImport.vue';
import availableItems from '../assets/data.json';

export default {
  name: 'Calculator',
  components: {
    draggable,
    CopyToClipboard,
    BillOfMaterials,
    RecipeImport
  },
  mounted() {
    this.loadFromUrl()
  },
  data: () => ({
    search: '',
    mobileSearch: '',
    selected: null,
    quantity: null,
    availableItems,
    items: [],
    quantityToRemove: {},
    dragging: false,
    resourceDialog: false,
    fab: false
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
  watch: {
    search(val) {
      if (val && val.endsWith('x') && /^[\d\s]+x$/.test(val)) {
        this.quantity = this.search.slice(0, this.search.length - 1).trim();
        this.search = '';
      }
    },
    mobileSearch(val) {
      if (val && val.endsWith('x') && /^[\d\s]+x$/.test(val)) {
        this.quantity = this.mobileSearch.slice(0, this.mobileSearch.length - 1).trim();
        this.mobileSearch = '';
      }
    },
    dragging(val) {
      if (val === false) {
        this.updateUrl()
      }
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
      if (!this.selected || !this.quantity) return;
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
      this.$refs.qty.blur();
      this.$refs.resource.focus();
      this.resourceDialog = false;
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
    },
    closeRemoveQuantity(item) {
      setTimeout(() => {
        delete this.quantityToRemove[item]
      }, 250)
    }
  }
}
</script>