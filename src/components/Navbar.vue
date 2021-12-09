<template>
  <b-navbar spaced wrapper-class="container" close-on-click transparent>
    <template #brand>
      <b-navbar-item tag="router-link" :to="{ path: '/' }" class="logo">
        <img
          src="/MetaRock_Logo.png"
          alt="First NFT market explorer"
          class="logo__img"
          width="80"
          height="64"
        />
      </b-navbar-item>
    </template>
    <template v-slot:start class="start">
      <b-navbar-item tag="router-link" :to="{ path: '/mySpace' }">
        {{ $t("Navbar.MySpace") }}
      </b-navbar-item>
      <b-navbar-item tag="router-link" :to="{ path: '/exploreChain' }">
        {{ $t("Navbar.Explore") }}
      </b-navbar-item>
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        {{ $t("Navbar.Info") }}
      </b-navbar-item>
    </template>

    <template v-slot:end>
      <b-navbar-item>
        <LocaleChanger />
      </b-navbar-item>
      <b-navbar-item>
        <b-button
          tag="router-link"
          :to="{ path: '/chooseNFT' }"
          type="is-inverte"
        >
          {{ $t("Navbar.CreateNFT") }}</b-button
        >
      </b-navbar-item>
      <b-navbar-item>
        <NavbarProfileDropdown />
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import LocaleChanger from "@/components/shared/SwitchLocale.vue";
import NavbarProfileDropdown from "@/components/rmrk/Profile/NavbarProfileDropdown.vue";
import { getCurrentColor } from "@/colors";
import i18n from "@/i18n";

@Component({
  components: {
    LocaleChanger,
    NavbarProfileDropdown,
  },
})
export default class NavbarMenu extends Vue {}
</script>

<style lang="scss">
@import "@/styles/variables";

.navbar {
  background: #6200e9 !important;
  padding-top: 5px !important;
  padding-bottom: 5px !important;
  &.is-spaced {
    & > .container {
      .navbar-menu {
        margin-right: 0;
        background: $head-background;
      }
    }
  }

  .logo {
    padding: 0.5rem 0.75rem;

    @include desktop {
      padding-left: 0;
    }
  }

  .navbar-item {
    font-size: 18px;
    font-weight: 600;
  }

  .navbar-brand {
    align-items: center;
  }

  .burger {
    margin-right: 0.5rem;
  }
}
</style>
