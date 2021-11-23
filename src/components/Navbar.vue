<template>
  <b-navbar
    fixed-top
    spaced
    wrapper-class="container"
    close-on-click
    transparent
    style="background: #6200e9"
  >
    <template #brand>
      <b-navbar-item tag="router-link" :to="{ path: '/' }" class="logo">
        <img
          src="/PolkaRock_Logosvg.svg"
          alt="First NFT market explorer on Kusama and Polkadot"
          class="logo__img"
          width="100"
          height="100"
        />
      </b-navbar-item>
    </template>
    <template v-slot:start class="start">
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        {{ $t("My Space") }}
      </b-navbar-item>
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        {{ $t("Explore") }}
      </b-navbar-item>
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        {{ $t("Info") }}
      </b-navbar-item>
    </template>
    <!-- <template v-slot:end>
      <LocaleChanger />
      <img
        src="/GB.png"
        alt="flag"
        width="30"
        height="30"
        class="logo__img"
        style="margin-right: 20px; background: white"
      />
      <b-button type="is-inverte" class="mr-3">Create NFT</b-button>
      <NavbarProfileDropdown />
    </template> -->
    <template v-slot:end>
      <b-navbar-item>
        <img
          src="/GB.png"
          alt="flag"
          width="30"
          height="30"
          class="logo__img"
          style="background: white"
        />
      </b-navbar-item>
      <b-navbar-item>
        <b-button type="is-inverte">Create NFT</b-button>
      </b-navbar-item>
      <b-navbar-item>
        <b-button type="is-primary">Connect Wallet</b-button>
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
  &.is-spaced {
    & > .container {
      .navbar-menu {
        margin-right: 0;
        background: $head-background;
      }
      // .is-active {
      //   background: $head-background;
      // }
      
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
    font-weight: 800;
  }

  .navbar-brand {
    align-items: center;
  }

  .burger {
    margin-right: 0.5rem;
  }
  // .navbar-dropdown{
  //   box-shadow: 0px 0px 5px 0.5px #d32e79 !important;
  // }
}
</style>
