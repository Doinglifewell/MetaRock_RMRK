<template>
  <section class="hero">
    <div class="hero-body">
      <Loader v-model="checkLoading" />
      <div class="container">
        <div class="columns is-mobile">
          <p class="head-text column">Choose Chain</p>
        </div>
        <div class="columns is-mobile">
          <div class="column">
            <b-dropdown aria-role="list">
              <template #trigger>
                <b-button
                  :label="switch_chain"
                  type="is-primary"
                  icon-right="caret-down"
                />
              </template>
              <b-dropdown-item
                aria-role="listitem"
                @click="switchCreateChain('Kusama')"
                >Kusama</b-dropdown-item
              >
              <b-dropdown-item
                aria-role="listitem"
                @click="switchCreateChain('Darwinia')"
                >Darwinia</b-dropdown-item
              >
              <b-dropdown-item
                aria-role="listitem"
                @click="switchCreateChain('Crab')"
                >Crab</b-dropdown-item
              >
              <b-dropdown-item
                aria-role="listitem"
                @click="switchCreateChain('Pangolin')"
                >Pangolin</b-dropdown-item
              >
              <b-dropdown-item aria-role="listitem">Moonbeam</b-dropdown-item>
              <b-dropdown-item aria-role="listitem">Ethereum</b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>
      <div class="container mt-5">
        <div class="columns is-mobile">
          <p class="head-text column">What would you like to create ?</p>
        </div>
        <div class="columns is-mobile">
          <div class="column">
            <b-button type="is-primary " class="mr-3 mt-2" @click="createNFT(1)"
              >Digital Asset</b-button
            >
            <b-button type="is-primary " class="mr-3 mt-2" @click="createNFT(2)"
              >Physical Asset</b-button
            >
            <b-button type="is-primary " class="mr-3 mt-2" @click="createNFT(3)"
              >Simple NFT</b-button
            >
            <p v-if="null_chian" class="null_chain">Please choose chain!</p>
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
const components = {
  Loader: () => import("@/components/shared/Loader.vue"),
};
@Component<ChooseNFT>({
  components,
})
export default class ChooseNFT extends Vue {
  public switch_chain: string = "Choose";
  public null_chian = false;
  public checkLoading = false;
  public switchCreateChain(data: string) {
    this.switch_chain = data;
    this.$store.dispatch("setCreateChain", data);
  }

  public async createNFT(type: number) {
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

    if (this.switch_chain == "Choose") {
      this.null_chian = true;
    } else {
      this.null_chian = false;
      if (type == 3) {
        this.checkLoading = true;

        Api().disconnect();
        Api().connect(
          NETWORK_ENDPOINTS[this.switch_chain].endpoints,
          NETWORK_ENDPOINTS[this.switch_chain].option
        );

        this.$store.subscribeAction(
          ({ type, payload }: ChangeUrlAction, _: any) => {
            if (type === "setApiUrl" && payload) {
              this.$store.commit("setLoading", true);
              Api().connect(payload, NETWORK_ENDPOINTS[this.switch_chain].option);
            }
          }
        );

        Api().on("connect", async (api: any) => {
          const { chainSS58, chainDecimals, chainTokens } = api.registry;
          const { genesisHash } = api;
          console.log(
            "[API] Connect to <3",
            NETWORK_ENDPOINTS[this.switch_chain].endpoints,
            {
              chainSS58,
              chainDecimals,
              chainTokens,
              genesisHash,
            }
          );
          this.$store.commit("setChainProperties", {
            ss58Format: correctFormat(chainSS58),
            tokenDecimals: chainDecimals[0] || 12,
            tokenSymbol: chainTokens[0] || "Unit",
            genesisHash: genesisHash || "",
          });
          this.checkLoading = false;
          this.$store.commit("setExplorer", { chain: this.switch_chain });
          this.$router.push("/rmrk/create");
        });
        Api().on("error", async (error: Error) => {
          this.$store.commit("setError", error);
          console.warn("[API] error", error);
          Api().disconnect()
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.null_chain {
  color: #f25aac;
  font-weight: 600;
  font-size: 30px;
}
</style>
