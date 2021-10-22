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
import availableItems from '../../assets/data.json';

export default {
  name: 'BillOfMaterials',
  props: {
    value: Boolean,
    url: String,
    items: Array
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
      dialog: !!this.value,
      availableItems
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
        const requires = this.generateRequires(item, quantity);
        newBillOfMaterials += `\n${quantity}x ${this.availableItems[item].name}${requires ? ` (${requires})` : ''}`;
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
        newBillOfMaterials += `\n${quantity}x ${this.availableItems[item].name}`;
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
    },
    generateRequires(item, quantity) {
      let text = '';
      item = this.availableItems[item];
      if (!item.raw) {
        return null;
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
    }
  }
}
</script>