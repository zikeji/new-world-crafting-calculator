<template lang="pug">
  div
    v-dialog(v-model="dialog" max-width="600px")
      v-form(v-model="valid" @submit="importRecipe")
        v-card
          v-card-title Import Recipe from New World Database
          v-divider
          v-card-text
            v-text-field(v-model="url" autofocus label="Recipe URL" placeholder="https://nwdb.info/db/recipe/" :rules="[value => !!value || 'Required.', value => urlRegex.test(value) || 'Must be a valid nwdb.info recipe URL.']")
            v-alert.mb-0(v-if="!!error" type="error" icon="mdi-alert") {{ error }}
          v-card-actions
            v-spacer
            v-btn(@click="dialog = false") Close
            v-btn(color="primary" @click="importRecipe" :disabled="!valid" :loading="loading") Import
              v-icon(right) mdi-import
    v-snackbar(v-model="unknownItemsSnackbar" color="red darken-2" :timeout="-1") {{ unknownItemsMessage }}
      template(v-slot:action="{ attrs }")
        v-btn(text @click="unknownItemsSnackbar = false") Close
</template>

<script>
import availableItems from '../../assets/data.json';

export default {
  name: 'NWDBImport',
  props: {
    recipeUrl: String
  },
  data() {
    return {
      dialog: false,
      loading: false,
      valid: false,
      error: '',
      url: '',
      urlRegex: /https?:\/\/nwdb\.info\/db\/recipe\/(.*)/,
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
  methods: {
    show() {
      this.dialog = true;
    },
    async importRecipe() {
      if (this.loading) return;
      this.loading = true;
      this.error = '';
      this.unknownItems = [];
      const matches = this.urlRegex.exec(this.url)
      const recipeName = matches[1];
      try {
        const response = await fetch(`${this.recipeUrl}${recipeName}`);
        this.loading = false;
        if (response.status === 404) {
          this.error = 'This recipe was not found.';
          return;
        }
        const recipe = await response.json();
        const items = [];
        for (const ingredient of recipe.ingredients) {
          if (!(ingredient.id in availableItems)) {
            this.unknownItems.push(ingredient.name);
            continue;
          }
          items.push({
            item: ingredient.id,
            quantity: ingredient.quantity
          });
        }
        if (this.unknownItems.length > 0) {
          this.unknownItemsSnackbar = true;
        }
        this.$emit('imported', items);
        this.dialog = false;
      } catch (e) {
        this.error = 'An unknown error occurred while loading this recipe.'
        this.loading = false;
        console.error(e);
      }
    }
  }
}
</script>