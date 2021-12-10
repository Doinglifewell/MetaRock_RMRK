<template>
  <section class="hero">
    <div class="hero-body">
      <Loader v-model="checkLoading" />
      <div class="container">
        <div class="columns is-mobile">
          <p class="head-text column">
            {{ $t("Mint.ChooseNFT.Choose Chain") }}
          </p>
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
              <b-dropdown-item @click="toast" aria-role="listitem"
                >Moonbeam</b-dropdown-item
              >
              <b-dropdown-item @click="toast" aria-role="listitem"
                >Ethereum</b-dropdown-item
              >
            </b-dropdown>
          </div>
        </div>
      </div>
      <div class="container mt-5">
        <div class="columns is-mobile">
          <p class="head-text column">
            {{ $t("Mint.ChooseNFT.What would you like to create") }}
          </p>
        </div>
        <div class="columns is-mobile">
          <div class="column">
            <b-button
              type="is-primary "
              class="mr-3 mt-2"
              @click="createNFT(1)"
              >{{ $t("Mint.ChooseNFT.Digital Asset") }}</b-button
            >
            <b-button
              type="is-primary "
              class="mr-3 mt-2"
              @click="createNFT(2)"
              >{{ $t("Mint.ChooseNFT.Physical Asset") }}</b-button
            >
            <b-button
              type="is-primary "
              class="mr-3 mt-2"
              @click="createNFT(3)"
              >{{ $t("Mint.ChooseNFT.Simple NFT") }}</b-button
            >
            <p v-if="null_chian" class="null_chain">
              {{ $t("Mint.ChooseNFT.Please choose chain") }}
            </p>
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
import i18n from "@/i18n";

const components = {
  Loader: () => import("@/components/shared/Loader.vue"),
};
@Component<ChooseNFT>({
  components,
})
export default class ChooseNFT extends Vue {
  public switch_chain: string | any = i18n.t("Mint.ChooseNFT.Choose Chain");
  public switch_chain_num = 0;
  public null_chian = false;
  public checkLoading = false;

  public switchCreateChain(data: string) {
    this.switch_chain = data;
    this.switch_chain_num = 1;
  }

  public toast() {
    const msg: string | any = i18n.t("Mint.ChooseNFT.toast");
    this.$buefy.toast.open({
      duration: 2000,
      message: msg,
      pauseOnHover: true,
      type: "is-white",
      position: "is-top-right",
    });
  }

  public async createNFT(type: number) {
    this.$store.dispatch("setCreateChain", this.switch_chain);
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
    if (type != 3) {
      this.toast();
    } else if (!this.switch_chain_num) {
      // this.null_chian = true;
      const msg: string | any = i18n.t("Mint.ChooseNFT.Please choose chain");
      this.$buefy.toast.open({
        duration: 2000,
        message: msg,
        pauseOnHover: true,
        position: "is-bottom",
        type: "is-danger",
      });
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
              Api().connect(
                payload,
                NETWORK_ENDPOINTS[this.switch_chain].option
              );
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
          this.$router.push("/rmrk/chooseCollection");
        });
        Api().on("error", async (error: Error) => {
          this.$store.commit("setError", error);
          console.warn("[API] error", error);
          Api().disconnect();
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
