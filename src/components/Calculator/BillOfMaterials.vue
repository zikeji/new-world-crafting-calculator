<template lang="pug">
  v-dialog(v-model="value" max-width="600px")
    v-card
      v-card-title Bill of Materials
      v-divider
      v-card-text
        v-textarea(v-model="text" readonly)
      v-card-actions
        v-spacer
        v-btn(@click="dialog = false") Close
        CopyToClipboard(v-model="text")
          template(v-slot="{ click }")
            v-btn.ml-2(color="primary" @click="click") Copy to clipboard
</template>

<script>
import CopyToClipboard from '../CopyToClipboard.vue';

export default {
  name: 'BillOfMaterials',
  props: {
    value: Boolean,
    url: String,
    items: Array,
    availableItems: Object,
    getName: Function,
    generateRequires: Function
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  components: {
    CopyToClipboard
  },
  data() {
    return {
      dialog: !!this.value
    }
  },
  watch: {
    value(val) {
      this.dialog = !!val;
    },
    dialog(val) {
      !!val !== this.value && this.$emit('input', val);
    }
  },
  computed: {
    text() {
      let newBillOfMaterials = '-- Materials --';
      for (const {item, quantity} of this.items) {
        newBillOfMaterials += `\n${quantity}x ${this.getName(item)} (${this.generateRequires(item, quantity)})`;
      }
      newBillOfMaterials += `\n\n-- Raw Materials --`;
      let rawItems = [];
      for (const {item, quantity} of this.items) {
        rawItems = [...rawItems, ...this.recurseRawItems(item, quantity)];
      }
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
        newBillOfMaterials += `\n${quantity}x ${this.getName(item)}`;
      }
      
      newBillOfMaterials += `\n\n${this.url}`;

      return newBillOfMaterials;
    }
  },
  methods: {
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
    }
  }
}
</script>