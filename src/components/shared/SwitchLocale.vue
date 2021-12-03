<template>
  <div>
    <b-dropdown aria-role="list">
      <template #trigger="{ active }">
        <b-button
          type="is-inverte"
          class="chain-button"
          :icon-right="active ? 'caret-up' : 'caret-down'"
        >
          <img
          :src="userFlag"
          alt="flag"
          class="logo-img"
        />
        </b-button>
      
      </template>
      <b-dropdown-item
        aria-role="listitem"
        v-for="lang in langsFlags"
        :key="lang.value"
        :value="userLang"
        :class="{ 'is-active': userLang === lang.value }"
        @click="setUserLang(lang.value)"
      >
        <div class="columns is-mobile">
          <img
            :src="lang.flag"
            class="column is-4 tag-flag"
            alt="flag"
          />
          <p class="column is-4">
            {{ lang.label }}
          </p>
        </div>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class LocaleChanger extends Vue {
  get langsFlags() {
    return this.$store.getters.getLangsFlags;
  }

  get userFlag() {
    return this.$store.getters.getUserFlag;
  }

  get userLang() {
    this.$i18n.locale = this.$store.getters.getUserLang;
    return this.$store.getters.getUserLang;
  }

  setUserLang(value: string) {
    this.$store.commit("setLanguage", { userLang: value });
    this.$i18n.locale = value;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.logo-img {
  @include desktop {
    padding-top: 10px;
  }
}
.tag-flag{
  max-width: 60px;
  max-height: 60px;
}
</style>
