<template>
  <b-dropdown position="is-bottom-left" aria-role="menu">
    <template #trigger>
      <span v-if="account()" class="is-mobile is-vcentered navbar__avatar">
        <!-- <Avatar class="navbar__avatar-icon" :value="account" :size="34" /> -->
        <b-button type="is-primary" class="navbar__button">
          <Identity
            :address="account()"
            :inline="true"
            class="navbar__address"
          />
        </b-button>
      </span>
      <template v-else>
        <b-button
          type="is-primary"
          class="navbar__button ml-3 my-3"
          @click="checkExtension()"
          >Connect Wallet</b-button
        >
      </template>
    </template>

    <template v-if="!isExtension">
      <!-- <b-dropdown-item v-if="!isExtension" custom aria-role="menuitem">
        <AccountSelect
          :label="$i18n.t('Account')"
          v-model="account"
          :tooltipVisible="false"
        />
      </b-dropdown-item> -->

      <b-dropdown-item
        custom
        aria-role="menuitem"
        v-for="option in accounts"
        :value="option.address"
        :key="option.address"
        :class="{ 'is-active': currentAccount === option.address }"
        @click="setUserLang(option.address)"
      >
      </b-dropdown-item>
    </template>

    <template v-if="isExtension">
      <b-dropdown-item has-link aria-role="menuitem">
        <a
          href="https://polkadot.js.org/extension/"
          rel="noopener noreferrer"
          target="_blank"
          class="is-flex is-align-items-center pl-3"
        >
          Install Desktop Wallet Extension
        </a>
      </b-dropdown-item>
      <b-dropdown-item has-link aria-role="menuitem">
        <a
          href="https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd"
          rel="noopener noreferrer"
          target="_blank"
          class="is-flex is-align-items-center pl-3"
        >
          Install Chrome Wallet Extension
        </a>
      </b-dropdown-item>
      <b-dropdown-item has-link aria-role="menuitem">
        <a
          href="https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/"
          rel="noopener noreferrer"
          target="_blank"
          class="is-flex is-align-items-center pl-3"
        >
          Install Firefox Wallet Extension
        </a>
      </b-dropdown-item>
    </template>
  </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from "vue-property-decorator";
import WithKeyring, { KeyringAccount } from "@/utils/WithKeyring";
import keyring from '@polkadot/ui-keyring'
import correctFormat from '@/utils/ss58Format'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import Avatar from "@/components/shared/Avatar.vue";

const components = {
  Avatar,
  AccountSelect: () => import("@/components/shared/AccountSelect.vue"),
  Identity: () => import("@/components/shared/format/Identity.vue"),
};

@Component({ components })
export default class NavbarProfileDropdown extends Mixins(WithKeyring) {
  @Prop({ default: "" }) public value!: string | KeyringAccount;
  protected changeAccount = false;
  protected isExtension = false;
  public currentAccount: string | KeyringAccount = "";
  public accounts: KeyringAccount[] = [];


 public async loadKeyring(): Promise<void> {
    const isDevelopment = process.env.VUE_APP_KEYRING === 'true'
    keyring.loadAll({
      ss58Format: correctFormat(this.ss58Format),
      type: 'sr25519',
      isDevelopment
    })
  }

  public async mountWasmCrypto(): Promise<void> {
    await cryptoWaitReady()
    console.log('wasmCrypto loaded')
    this.loadKeyring()
    this.$store.commit('keyringLoaded')
  }

  created() {
    // this.mountWasmCrypto()
    this.accounts = this.allAcctounts();
    console.log("this.accounts:", this.accounts)
  }

  // set account(account: string) {
  //   console.log("setAuth", account);
  //   this.$store.dispatch("setAuth", { address: account });
  // }

  // get account() {
  //   return this.$store.getters.getAuthAddress;
  // }

  account(): string {
    return typeof this.currentAccount === "string"
      ? this.currentAccount
      : this.currentAccount.address;
  }

  setUserLang(value: string) {
    console.log("setAuth", value);
    this.$store.dispatch("setAuth", { address: value });
    this.currentAccount = value;
  }

  checkExtension() {
    if (!(window as any).injectedWeb3["polkadot-js"]) {
      this.isExtension = true;
      this.$buefy.toast.open({
        message: "You need to install the browser extension - polkadot.js!",
        duration: 9000,
      });
    }
  }
}
</script>

<style lang="scss">
@import "bulma/bulma.sass";

.dropdown-content {
  background: $white !important;
}
.navbar {
  &__identity {
    @include from($desktop) {
      display: none;
    }
  }

  &__avatar {
    display: flex;
    align-items: center;
  }

  &__avatar-icon {
    cursor: pointer;

    @include until($desktop) {
      padding-right: 0.75rem;
    }
  }

  &__address {
    text-transform: none;
  }
}
</style>
