<template lang="pug">
  div
    v-dialog(v-model="dialog" max-width="600px")
      v-form(v-model="valid" ref="form" @submit="send")
        v-card
          v-card-title Leave Site Feedback
          v-divider
          v-card-text
            v-select(v-model="type" label="Feedback Type" filled autofocus :items="['General', 'Missing Ingredients', 'Complaint']" :rules="[value => !!value || 'Required.']")
            v-textarea(v-model="message" label="Your Message" placeholder="Please supply any questions, comments, or concerns here. If you expect a response, be sure to include your Discord tag (User#0000)." filled auto-grow counter="2048" :rules="[value => !!value || 'Required.', value => value.length > 32 || 'Feedback must be over 32 characters.']")
            vue-recaptcha.mt-2(:sitekey="recaptchaSiteKey" ref="recaptcha" :loadRecaptchaScript="true" :theme="$vuetify.theme.dark ? 'dark' : 'light'" @verify="recaptchaResponse = $event" @expired="recaptchaResponse = ''")
            v-alert.mt-2.mb-0(v-if="!!error" type="error" icon="mdi-alert") {{ error }}
          v-card-actions
            v-spacer
            v-btn(@click="dialog = false") Close
            v-btn(color="primary" @click="send" :disabled="!valid || !recaptchaResponse" :loading="loading") Send
              v-icon(right) mdi-send
    v-dialog(v-model="successDialog" max-width="400")
      v-card(color="success")
        v-card-title Your feedback was submitted!
        v-card-actions
          v-spacer
          v-btn(text @click="successDialog = false") OK
</template>

<script>
import VueRecaptcha from "vue-recaptcha";

export default {
  name: "Feedback",
  components: {
    VueRecaptcha,
  },
  props: {
    feedbackUrl: String,
  },
  data() {
    return {
      dialog: false,
      loading: false,
      valid: false,
      type: "",
      message: "",
      recaptchaSiteKey: process.env.VUE_APP_RECAPTCHA_SITEKEY,
      recaptchaResponse: "",
      error: "",
      successDialog: false
    };
  },
  watch: {
    dialog(val) {
      if (!val) {
        this.type = '';
        this.recaptchaSiteKey = '';
        this.message = '';
        this.$refs.form.resetValidation();
        this.$refs.recaptcha.reset();
      }
    }
  },
  methods: {
    show() {
      this.dialog = true;
    },
    async send() {
      if (this.loading) return;
      this.error = "";
      this.loading = true;
      try {
        const response = await fetch(this.feedbackUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: this.type,
            message: this.message,
            r: this.recaptchaResponse,
          }),
        });
        const data = await response.json();
        this.loading = false;
        if (data.success) {
          this.dialog = false;
          this.type = "";
          this.message = "";
          this.recaptchaResponse = "";
          this.successDialog = true;
        } else {
          this.error =
            "An unknown error occurred while submitting your feedback.";
        }
      } catch (e) {
        this.error =
          "An unknown error occurred while submitting your feedback.";
      }
    },
  },
};
</script>
