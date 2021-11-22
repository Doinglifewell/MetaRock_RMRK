<template>
  <b-navbar
    fixed-top
    spaced
    wrapper-class="container"
    close-on-click
    >
    <template #brand>
      <b-navbar-item tag="router-link" :to="{ path: '/' }" class="logo">
        <img
          src="/PolkaRock_Logosvg.svg"
          alt="First NFT market explorer on Kusama and Polkadot"
          class="logo__img"
          width="100"
          height="100"
        >
      </b-navbar-item>
    </template>
    <template v-slot:start class="start">
      <b-navbar-item
        tag="router-link"
        :to="{ path: '/'}">
        {{ $t('My Space') }}
      </b-navbar-item>
      <b-navbar-item
        tag="router-link"
        :to="{ path: '/'}">
        {{ $t('Explore') }}
      </b-navbar-item>
      <b-navbar-item
        tag="router-link"
        :to="{ name: '/'}">
        {{ $t('Info') }}
      </b-navbar-item>
    </template>
    <template v-slot:end>
      <LocaleChanger />
      <NavbarProfileDropdown />
    </template>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import LocaleChanger from '@/components/shared/SwitchLocale.vue'
import NavbarProfileDropdown from '@/components/rmrk/Profile/NavbarProfileDropdown.vue'
import { getCurrentColor } from '@/colors'
import i18n from '@/i18n'

@Component({
  components: {
    LocaleChanger,
    NavbarProfileDropdown
  }
})
export default class NavbarMenu extends Vue {
  private color: string = getCurrentColor()
  public navbar: any = [
    {
      name: i18n.t('Gallery'),
      tag: 'router-link',
      to: { name: 'nft' },
      strong: true
    },
  ]
  public navbarExtra: any = [
    {
      name: i18n.t('Accounts'),
      icon: 'users',
      to: { name: 'accounts' },
      tag: 'router-link',
    },
    {
      name: i18n.t('Credit'),
      icon: 'users',
      to: { name: 'rmrkCredit' },
      tag: 'router-link',
      strong: true
    },
    {
      name: i18n.t('Transfer'),
      icon: 'paper-plane',
      to: { name: 'transfer' },
      tag: 'router-link',
    },
    {
      name: i18n.t('Settings'),
      icon: 'cogs',
      tag: 'router-link',
      to: { name: 'settings' },
    },
  ]
  private navbarExternal: any = [
    {
      name: 'Twitter',
      tag: 'a',
      href: 'https://twitter.com/Kodadot'
    }
  ]

  // get chainColor() {
  //   return {
  //     'border-bottom': `4px ${this.color} solid`
  //   }
  // }
}
</script>

<style lang="scss">
@import '@/styles/variables';

.navbar {
  &.is-spaced {
    & > .container {
      .navbar-menu {
        margin-right: 0;
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
  .navbar-dropdown{
    box-shadow: 0px 0px 5px 0.5px #d32e79 !important;
  }
}
</style>
