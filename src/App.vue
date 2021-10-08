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
            v-card.mx-auto.mt-5
              v-card-text
                .d-flex.flex-row.align-stretch
                  v-autocomplete.mr-2(v-model="selected" filled :items="Object.entries(availableItems).map(i => ({ ...i[1], id: i[0] })).sort((a, b) => a.name === b.name ? 0 : a.name < b.name ? -1 : 1)" label="Resource" item-text="name" item-value="id" hide-details @input="$refs.qty.focus()" return-object)
                  v-text-field.mr-2(v-model="quantity" ref="qty" filled type="number" label="Quantity" hide-details)
                  div
                    v-btn.align-self-stretch(color="primary" height="100%" :disabled="!selected || !quantity" @click="add")
                      | Add
                      v-icon mdi-plus
              v-divider(v-if="items.length > 0")
              v-list-item(v-for="{item, quantity} in items" :key="item")
                v-list-item-content
                  v-list-item-title
                    span.text-h5.font-weight-bold {{ quantity }}x
                    span.text-h6.font-weight-light &nbsp; {{ getName(item) }}
                  v-list-item-subtitle.wrap-text {{ generateRequires(item, quantity) }}
                v-list-item-action
                  v-btn(icon @click="remove(item)")
                    v-icon(color="error") mdi-delete
              v-card-actions
                v-spacer
                v-btn(@click="copyLink" :disabled="this.items.length === 0") Copy Link
                v-btn(color="secondary" @click="viewBOM" :disabled="this.items.length === 0") View BOM
            v-dialog(v-model="bomDialog" max-width="600px")
              v-card
                v-card-title Bill of Materials
                v-divider
                v-card-text
                  v-textarea(v-model="bom" readonly)
                v-card-actions
                  v-spacer
                  v-btn(@click="bomDialog = false") Close
                  v-btn(color="primary") Copy to Clipboard
            v-overlay(:value="loadData.loading")
              v-progress-circular(indeterminate size="64")
            v-overlay(:value="loadData.error")
              v-container.text-center
                v-icon(color="error" size="64") mdi-alert
                div.text-heading-5 Failed to load data. Please try again.
    Footer

</template>

<script>
import AppBar from './components/AppBar.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  mounted() {
    if (localStorage && localStorage.dark === 'false') {
      this.$vuetify.theme.dark = false;
    }
    fetch('data.json').then((response) => response.json()).then((data) => {
      this.availableItems = data;
      this.loadData.loading = false;
    }).catch(() => {
      this.loadData.loading = false;
      this.loadData.error = true;
    });
  },
  components: {
    AppBar,
    Footer
  },
  data: () => ({
    loadData: {
      loading: true,
      error: ''
    },
    selected: null,
    quantity: null,
    availableItems: [],
    items: [],
    bomDialog: false,
    bom: ''
  }),
  computed: {
    url() {
      const params = new URLSearchParams(window.location.search);
      const newURL = new URL(window.location.href);
      if (this.items.length > 0) {
        const p = [];
        for (const item of this.items) {
          p.push(`${item.item}|${item.quantity}`);
        }
        params.set('s', btoa(p.join(',')));
      } else {
        params.delete('s');
      }
      newURL.search = params.toString();
      return newURL.href;
    }
  },
  methods: {
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
          item: this.selected.id
        });
      }
      this.selected = null;
      this.quantity = null;
      this.updateUrl();
    },
    remove(item) {
      const currentIndex = this.items.findIndex(c => c.item === item);
      if (currentIndex > -1) {
        this.items.splice(currentIndex, 1);
        this.updateUrl();
      }
    },
    getName(item) {
      return this.availableItems[item].name;
    },
    generateRequires(item, quantity) {
      let text = '';
      item = this.availableItems[item];
      if (!item.raw) {
        return 'Raw material.';
      }
      for (let i = 0; i < item.raw.length; i += 1) {
        if (i !== 0) {
          text += ', ';
        }
        if (item.raw.length > 1 && i === item.raw.length - 1) {
          text += '& ';
        }
        text += `${quantity * item.raw[i][1]} ${this.availableItems[item.raw[i][0]].name}`;
      }
      return text;
    },
    copyLink() {
      navigator.clipboard.writeText(this.url);
    },
    recurseRawItems(itemName, quantity) {
      let rawItems = [];
      const item = this.availableItems[itemName];
      if (item.raw) {
        for (const [rawItem, rawQuantity] of item.raw) {
          rawItems = [...rawItems, ...this.recurseRawItems(rawItem, quantity * rawQuantity)];
        }
      } else {
        rawItems.push({
          item: itemName,
          quantity: quantity
        });
      }
      return rawItems;
    },
    viewBOM() {
      this.bom = '-- Materials --';
      for (const {item, quantity} of this.items) {
        this.bom += `\n${quantity}x ${this.getName(item)} (${this.generateRequires(item, quantity)})`;
      }
      this.bom += `\n\n-- Raw Materials --`;
      let rawItems = [];
      for (const {item, quantity} of this.items) {
        rawItems = [...rawItems, ...this.recurseRawItems(item, quantity)];
      }
      console.log(rawItems);
      const mergedRawItems = [];
      for (const {item, quantity} of rawItems) {
        const index = mergedRawItems.findIndex(m => m.item === item);
        if (index > -1) {
          mergedRawItems[index].quantity += quantity;
          continue;
        }
        mergedRawItems.push({item, quantity});
      }
      
      for (const {item, quantity} of mergedRawItems) {
        this.bom += `\n${quantity}x ${this.getName(item)}`;
      }
      
      this.bom += `\n\n${this.url}`;
      
      this.bomDialog = true;
    }
  }
};
</script>
