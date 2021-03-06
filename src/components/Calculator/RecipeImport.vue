<template lang="pug">
  div
    v-dialog(v-model="dialog" max-width="600px")
      v-card
        v-card-title Import Recipe
        v-divider
        v-card-text
          .d-flex.flex-column.flex-sm-row.align-stretch.mt-5
            v-autocomplete.mr-0.mr-sm-2.mb-4.mb-sm-0(v-model="recipe" ref="recipe" :search-input.sync="search" filled :items="recipes" label="Recipe Name" item-text="name" item-value="id" hide-details return-object @input="$refs.recipe.blur(); $refs.qty.focus()")
              template(v-slot:item="{ item }")
                v-list-item-content
                  v-list-item-title(:class="getClass(item)" v-html="mask(item.name)")
                  v-list-item-subtitle {{ item.type }}
            v-text-field(v-model="quantity" ref="qty" filled type="number" label="Quantity" hide-details @keydown.enter="importRecipe" :style="$vuetify.breakpoint.xs ? '' : 'width: 50px;'")
        v-card-actions
          v-spacer
          v-btn(@click="dialog = false") Close
          v-btn(color="primary" @click="importRecipe" :disabled="!recipe || !quantity") Import
            v-icon(right) mdi-import
    v-snackbar(v-model="unknownItemsSnackbar" color="red darken-2" :timeout="-1") {{ unknownItemsMessage }}
      template(v-slot:action="{ attrs }")
        v-btn(text @click="unknownItemsSnackbar = false") Close
</template>

<script>
import availableItems from '../../assets/data.json';
import recipes from '../../assets/recipes.json';

export default {
  name: 'RecipeImport',
  data() {
    return {
      dialog: false,
      recipes,
      search: '',
      recipe: null,
      quantity: 1,
      unknownItemsSnackbar: false,
      unknownItems: []
    };
  },
  computed: {
    unknownItemsMessage() {
      if (this.unknownItems.length === 0) return '';
      let message = '';
      if (this.unknownItems.length === 1) {
        message += `The ingredient "${this.unknownItems[0]}" is not in our database.`;
      } else if (this.unknownItems.length === 2) {
        message += `The ingredients "${this.unknownItems[0]}" and "${this.unknownItems[1]}" are not in our database.`;
      } else {
        message += `The ingredients "${this.unknownItems.join('", "').replace(/, ([^,]*)$/, ', and $1')}" are not in our database.`;
      }
      message += ' Known ingredients were imported. Please contact me on Discord to request the addition of these items.';

      return message;
    }
  },
  watch: {
    search(val) {
      if (val && val.endsWith('x') && /^[\d\s]+x$/.test(val)) {
        this.quantity = this.search.slice(0, this.search.length - 1).trim();
        this.search = '';
      }
    }
  },
  methods: {
    show() {
      this.unknownItems = [];
      this.recipe = null;
      this.search = '';
      this.quantity = 1;
      this.dialog = true;
    },
    getClass(item) {
      if (['Armor', 'Weapon', 'Tool', 'Bag', 'Jewelry', 'Dungeon Replica'].includes(item.type)) {
        return item.tier ? `rarity-${item.tier}`: null;
      }
      return item.rarity ? `rarity-${item.rarity}`: null;
    },
    mask(name) {
      if (!this.search) return name;
      const search = this.search.toLocaleLowerCase();
      const index = name.toLocaleLowerCase().indexOf(search);
      if (index < 0) return name;
      return `${name.slice(0, index)}<span class="v-list-item__mask">${name.slice(index, index+search.length)}</span>${name.slice(index + search.length)}`;
    },
    importRecipe() {
      console.log(this.recipe)
      
      const items = [];
      for (const [ingredient, quantity] of this.recipe.ingredients) {
        if (!(ingredient in availableItems)) {
          this.unknownItems.push(ingredient);
          continue;
        }
        items.push({
          item: ingredient,
          quantity: quantity * this.quantity
        });
      }
      if (this.unknownItems.length > 0) {
        this.unknownItemsSnackbar = true;
      }
      this.$emit('imported', items);
      this.dialog = false;
    }
  }
}
</script>