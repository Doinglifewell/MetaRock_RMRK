<template>
  <section class="hero">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-mobile">
          <p class="head-text column">Choose Chain</p>
        </div>
        <div class="columns is-mobile">
          <div class="column">
            <b-button
              @click="switchCreateChain('kusama')"
              type="is-primary"
              class="mr-3 mt-2"
              >Kusama</b-button
            >
            <b-button
              @click="switchCreateChain('darwinia')"
              type="is-primary"
              class="mr-3 mt-2"
              >Darwinia</b-button
            >
            <b-button
              @click="switchCreateChain('crab')"
              type="is-primary"
              class="mr-3 mt-2"
              >Crab</b-button
            >
            <b-button
              @click="switchCreateChain('pangolin')"
              type="is-primary"
              class="mr-3 mt-2"
              >Pangolin</b-button
            >
            <b-button type="is-primary" class="mr-3 mt-2">Moonbeam</b-button>
            <b-button type="is-primary" class="mr-3 mt-2">Ethereum</b-button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Connector from "@/utils/vue-api2";
import correctFormat from "@/utils/ss58Format";

@Component<ChooseChain>({})
export default class ChooseChain extends Vue {
  public async switchCreateChain(data: string) {

    const NETWORK_ENDPOINTS = {
      "kusama"   : { endpoints: "wss://kusama-rpc.polkadot.io", option: 1 },
      "darwinia" : { endpoints: "wss://rpc.darwinia.network", option: 2 },
      "crab"     : { endpoints: "wss://crab-rpc.darwinia.network", option: 2 },
      "pangolin" : { endpoints: "wss://pangolin-rpc.darwinia.network", option: 2 },
    };

    this.$store.dispatch("setCreateChain", data);
    interface ChangeUrlAction {
      type: string;
      payload: string;
    }
    const { getInstance: Api } = Connector;
    Api().disconnect();
    Api().connect(NETWORK_ENDPOINTS[data].endpoints, NETWORK_ENDPOINTS[data].option);

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

      this.$store.commit("setExplorer", { chain: data });
      this.$router.push("/chooseNFT");
    });
    Api().on("error", async (error: Error) => {
      this.$store.commit("setError", error);
      console.warn("[API] error", error);
      // Api().disconnect()
    });
  }
}
</script>

<style lang="scss" scoped>
</style>
