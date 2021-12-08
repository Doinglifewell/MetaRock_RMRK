<template>
  <section class="hero">
    <div class="hero-body">
      <Loader v-model="checkLoading" />
      <div class="container">
        <div class="columns is-mobile">
          <p class="head-text column">{{ $t("Explore.Choose Chain") }}</p>
        </div>
        <div class="columns is-mobile">
          <div class="column">
            <b-dropdown aria-role="list">
              <template #trigger>
                <b-button
                  label="Choose Chain"
                  type="is-primary"
                  icon-right="caret-down"
                />
              </template>
              <b-dropdown-item
                aria-role="listitem"
                @click="switchExploreChain('Kusama')"
                >Kusama</b-dropdown-item
              >
              <b-dropdown-item
                aria-role="listitem"
              @click="toast('Darwinia')"
                >Darwinia</b-dropdown-item
              >
              <b-dropdown-item
                aria-role="listitem"
                @click="switchExploreChain('Crab')"
                >Crab</b-dropdown-item
              >
              <b-dropdown-item
                aria-role="listitem"
                @click="switchExploreChain('Pangolin')"
                >Pangolin</b-dropdown-item
              >
              <b-dropdown-item @click="toast('Moonbeam')" aria-role="listitem"
                >Moonbeam</b-dropdown-item
              >
              <b-dropdown-item @click="toast('Ethereum')" aria-role="listitem"
                >Ethereum</b-dropdown-item
              >
            </b-dropdown>
            <!-- <b-button
              @click="switchExploreChain('Kusama')"
              type="is-primary"
              class="mr-3 mt-2"
              >Kusama</b-button
            >
            <b-button
              @click="toast('Darwinia')"
              type="is-primary"
              class="mr-3 mt-2"
              >Darwinia</b-button
            >
            <b-button
              @click="switchExploreChain('Crab')"
              type="is-primary"
              class="mr-3 mt-2"
              >Crab</b-button
            >
            <b-button
              @click="switchExploreChain('Pangolin')"
              type="is-primary"
              class="mr-3 mt-2"
              >Pangolin</b-button
            >
            <b-button
              @click="toast('Moonbeam')"
              type="is-primary"
              class="mr-3 mt-2"
              >Moonbeam</b-button
            >
            <b-button
              @click="toast('Ethereum')"
              type="is-primary"
              class="mr-3 mt-2"
              >Ethereum</b-button
            > -->
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Connector from "@/utils/vue-api2";
import i18n from "@/i18n";
import correctFormat from "@/utils/ss58Format";
const components = {
  Loader: () => import("@/components/shared/Loader.vue"),
};
@Component<ExploreChain>({ components })
export default class ExploreChain extends Vue {
  public checkLoading = false;

  public toast(chain: string) {
    const msg : string| any = i18n.t("Explore.ExploreChain.toast", [chain]);
    this.$buefy.toast.open({
      duration: 2000,
      message: msg,
      pauseOnHover: true,
      type: 'is-white',
      position: 'is-top-right',
    });
  }

  public switchExploreChain(data: string) {
    const NETWORK_ENDPOINTS = {
      Kusama: { endpoints: "wss://kusama-rpc.polkadot.io", option: "kusama" },
      Darwinia: { endpoints: "wss://rpc.darwinia.network", option: "darwinia" },
      Crab: {
        endpoints: "wss://crab-rpc.darwinia.network",
        option: "darwinia",
      },
      Pangolin: {
        endpoints: "wss://pangolin-rpc.darwinia.network",
        option: "darwinia",
      },
    };
    const { getInstance: Api } = Connector;
    interface ChangeUrlAction {
      type: string;
      payload: string;
    }
    this.checkLoading = true;

    Api().disconnect();
    Api().connect(
      NETWORK_ENDPOINTS[data].endpoints,
      NETWORK_ENDPOINTS[data].option
    );

    this.$store.subscribeAction(
      ({ type, payload }: ChangeUrlAction, _: any) => {
        if (type === "setApiUrl" && payload) {
          this.$store.commit("setLoading", true);
          Api().connect(payload, NETWORK_ENDPOINTS[data].option);
        }
      }
    );

    Api().on("connect", async (api: any) => {
      const { chainSS58, chainDecimals, chainTokens } = api.registry;
      const { genesisHash } = api;
      console.log("[API] Connect to <3", NETWORK_ENDPOINTS[data].endpoints, {
        chainSS58,
        chainDecimals,
        chainTokens,
        genesisHash,
      });
      this.$store.commit("setChainProperties", {
        ss58Format: correctFormat(chainSS58),
        tokenDecimals: chainDecimals[0] || 12,
        tokenSymbol: chainTokens[0] || "Unit",
        genesisHash: genesisHash || "",
      });
      this.checkLoading = false;
      this.$store.commit("setExplorer", { chain: data });
      this.$router.push("/rmrk/gallery");
    });
    Api().on("error", async (error: Error) => {
      this.$store.commit("setError", error);
      console.warn("[API] error", error);
      Api().disconnect();
    });
  }
}
</script>

<style lang="scss" scoped></style>
