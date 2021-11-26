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
import Connector from "@/utils/vue-api2/dist";
import correctFormat from "@/utils/ss58Format";

@Component<ChooseChain>({})
export default class ChooseChain extends Vue {
  public switchCreateChain(data: string) {
    interface ChangeUrlAction {
      type: string;
      payload: string;
    }

    // const network_endpoint = {
    //   kuasama: "wss://kusama-rpc.polkadot.io",
    //   darwinia: "wss://rpc.darwinia.network",
    //   crab: "wss://crab-rpc.darwinia.network",
    //   pangolin: "wss://pangolin-rpc.darwinia.network"
    // };

    let network_endpoint = "wss://kusama-rpc.polkadot.io";
    let networkOption = 1;
    if (data == "kusama") network_endpoint = "wss://kusama-rpc.polkadot.io", networkOption = 1;
    else if (data == "darwinia") network_endpoint = "wss://rpc.darwinia.network", networkOption = 2;
    else if (data == "crab") network_endpoint = "wss://crab-rpc.darwinia.network", networkOption = 2;
    else if (data == "pangolin") network_endpoint = "wss://pangolin-rpc.darwinia.network", networkOption = 2;

  console.log("network:",network_endpoint)

    this.$store.dispatch("setCreateChain", data);

    const { getInstance: Api } = Connector;
    Api().disconnect();
    Api().connect(network_endpoint, networkOption);

    this.$store.subscribeAction(
      ({ type, payload }: ChangeUrlAction, _: any) => {
        if (type === "setApiUrl" && payload) {
          this.$store.commit("setLoading", true);
          Api().connect(payload, networkOption);
        }
      }
    );

    Api().on("connect", async (api: any) => {
      const { chainSS58, chainDecimals, chainTokens } = api.registry;
      const { genesisHash } = api;
      console.log("[API] Connect to <3", network_endpoint, {
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
.chain_button {
  border: none;
  border-radius: 0;
  background-color: transparent !important;
  box-shadow: none;
  position: relative;
  padding: 0 8px;

  &:hover,
  &:focus,
  &:active {
    border: none;
    box-shadow: none;
  }

  &:not(:last-child) {
    &:after {
      content: "";
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 0;
      width: 1px;
      height: 12px;
      background: #fff;
    }
  }
}
</style>
