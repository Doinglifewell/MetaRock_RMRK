<template>
  <div class="container">
    <div>
      <Loader v-model="isLoading" :status="status" />
      <!-- <b-field>
        <Auth />
      </b-field> -->
      <!-- <h6 class="subtitle is-6">
        You have minted {{ selectedCollection.alreadyMinted }} out of
        {{ selectedCollection.max || Infinity }}
      </h6> -->
      <CreateItem1
        v-bind.sync="nft"
        :max="selectedCollection.max"
        :alreadyMinted="selectedCollection.alreadyMinted"
      />
      <b-field>
        <CollapseWrapper
          v-if="nft.edition > 1"
          visible="mint.expert.show"
          hidden="mint.expert.hide"
          class="mt-3"
        >
          <BasicSwitch
            class="mt-3"
            v-model="postfix"
            label="mint.expert.postfix"
          />
        </CollapseWrapper>
      </b-field>
      <b-field>
        <PasswordInput v-model="password" :account="accountId" />
      </b-field>
      <b-field class="level-right">
        <b-button
          type="is-primary"
          icon-left="paper-plane"
          @click="submit"
          :disabled="disabled"
          :loading="isLoading"
          outlined
        >
          {{ $t("mint.submit") }}
        </b-button>
      </b-field>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Mixins } from "vue-property-decorator";
import CreateItem1 from "./CreateItem1.vue";
import Tooltip from "@/components/shared/Tooltip.vue";
import Support from "@/components/shared/Support.vue";
import Connector from "@/utils/vue-api2";
import exec, {
  execResultValue,
  txCb,
  estimate,
} from "@/utils/transactionExecutor";
import { notificationTypes, showNotification } from "@/utils/notification";
import { NFT, NFTMetadata, MintNFT, getNftId } from "../service/scheme";
import { pinJson, getKey, revokeKey } from "@/proxy";
import { unSanitizeIpfsUrl, ipfsToArweave } from "@/utils/ipfs";
import PasswordInput from "@/components/shared/PasswordInput.vue";
import NFTUtils, { basicUpdateFunction } from "../service/NftUtils";
import RmrkVersionMixin from "@/utils/mixins/rmrkVersionMixin";
import { supportTx, MaybeFile, calculateCost, offsetTx } from "@/utils/support";
import collectionFromId from "@/queries/collectionFromId.graphql";
import TransactionMixin from "@/utils/mixins/txMixin";
import ChainMixin from "@/utils/mixins/chainMixin";
import shouldUpdate from "@/utils/shouldUpdate";
import {
  nsfwAttribute,
  offsetAttribute,
  secondaryFileVisible,
} from "./mintUtils";
import { formatBalance } from "@polkadot/util";
import { DispatchError } from "@polkadot/types/interfaces";
import { APIKeys, pinFile as pinFileToIPFS } from "@/pinata";

interface NFTAndMeta extends NFT {
  meta: NFTMetadata;
}

type MintedCollection = {
  id: string;
  name: string;
  alreadyMinted: number;
  max: number;
  metadata: string;
  symbol: string;
};

@Component({
  components: {
    Auth: () => import("@/components/shared/Auth.vue"),
    CreateItem1,
    PasswordInput,
    Tooltip,
    Support,
    Money: () => import("@/components/shared/format/Money.vue"),
    Loader: () => import("@/components/shared/Loader.vue"),
    ArweaveUploadSwitch: () => import("./ArweaveUploadSwitch.vue"),
    CollapseWrapper: () =>
      import("@/components/shared/collapse/CollapseWrapper.vue"),
    BasicSwitch: () => import("@/components/shared/form/BasicSwitch.vue"),
  },
})
export default class CreateNFT extends Mixins(
  RmrkVersionMixin,
  TransactionMixin,
  ChainMixin
) {
  protected nft: MintNFT = {
    name: "",
    description: "",
    edition: 1,
    tags: [],
    nsfw: false,
    price: 0,
    file: undefined,
    secondFile: undefined,
  };
  private selectedCollection: MintedCollection = {
    id: "",
    name: "",
    alreadyMinted: 0,
    max: 0,
    metadata: "",
    symbol: "",
  };

  private password = "";
  private alreadyMinted = 0;
  private hasSupport = false;
  private estimated = "";
  private hasCarbonOffset = false;
  private filePrice = 0;
  protected arweaveUpload = false;
  protected postfix = true;
  private id = "";

  get accountId() {
    return this.$store.getters.getAuthAddress;
  }

  get createChain(): string {
    return this.$store.getters.getCreateChain;
  }

  // @Watch("accountId", { immediate: true })
  // hasAccount(value: string, oldVal: string) {
  //   if (shouldUpdate(value, oldVal)) {
  //     this.fetchCollections();
  //   }
  // }

  public async fetchCollections() {
    const apolloClient = this.createChain;
    console.log("fetchCollections");
    const collections = await this.$apollo.query({
      query: collectionFromId,
      variables: {
        id: this.id,
      },
      client: apolloClient,
      fetchPolicy: "network-only",
    });

    this.selectedCollection.id = collections.data.collectionEntity.id;
    this.selectedCollection.name = collections.data.collectionEntity.name;
    this.selectedCollection.max = collections.data.collectionEntity.max;
    this.selectedCollection.metadata =
      collections.data.collectionEntity.metadata;
    this.selectedCollection.symbol = collections.data.collectionEntity.symbol;
    this.selectedCollection.alreadyMinted =
      collections.data.collectionEntity.nfts.totalCount;

    console.log("selectedCollection:", this.selectedCollection);
  }

  get disabled() {
    return !(this.nft.name && this.nft.file && this.selectedCollection);
  }

  public checkId(): void {
    if (this.$route.params.id) {
      this.id = this.$route.params.id;
    }
  }

  public created(): void {
    // this.$store.dispatch("setOldCreateChain", this.$store.getters.getCreateChain);
    this.checkId();
    this.fetchCollections();
  }

  @Watch("nft.file")
  @Watch("nft.secondFile")
  private calculatePrice() {
    this.filePrice = calculateCost(
      ([this.nft.file, this.nft.secondFile] as MaybeFile[]).filter(
        (a) => typeof a !== "undefined"
      )
    );
  }

  private toRemark(remark: string) {
    const { api } = Connector.getInstance();
    return api.tx.system.remark(remark);
  }

  protected async canSupport() {
    if (this.hasSupport) {
      return [
        await supportTx([
          this.nft.file as MaybeFile,
          this.nft.secondFile as MaybeFile,
        ]),
      ];
    }

    return [];
  }

  protected async canOffset() {
    if (this.hasCarbonOffset) {
      return [await offsetTx(1)];
    }

    return [];
  }

  protected async submit() {
    if (!this.selectedCollection) {
      throw ReferenceError("[MINT] Unable to mint without collection");
    }

    this.isLoading = true;
    this.status = "loader.ipfs";
    const { api } = Connector.getInstance();
    const { alreadyMinted, symbol } = this.selectedCollection;

    try {
      const metadata = await this.constructMeta();
      // missin possibility to handle more than one remark

      const mint = NFTUtils.createMultipleNFT(
        this.nft.edition,
        this.accountId,
        symbol,
        this.nft.name,
        metadata,
        alreadyMinted,
        this.postfix && this.nft.edition > 1 ? basicUpdateFunction : undefined
      );
      const mintString = mint.map((nft) =>
        NFTUtils.encodeNFT(nft, this.version)
      );

      const isSingle =
        mintString.length === 1 && (!this.hasSupport || this.hasCarbonOffset);

      const cb = isSingle ? api.tx.system.remark : api.tx.utility.batchAll;
      const args = isSingle
        ? mintString[0]
        : [
            ...mintString.map(this.toRemark),
            ...(await this.canSupport()),
            ...(await this.canOffset()),
          ];

      const tx = await exec(
        this.accountId,
        "",
        cb,
        [args],
        txCb(
          async (blockHash) => {
            execResultValue(tx);
            const header = await api.rpc.chain.getHeader(blockHash);
            const blockNumber = header.number.toString();

            showNotification(
              `[NFT] Saved ${this.nft.edition} entries in block ${blockNumber}`,
              notificationTypes.success
            );

            this.isLoading = false;

            // if (this.nft.price) {
            //   this.listForSale(mint, blockNumber);
            // } else {
            //   this.navigateToDetail(mint[0], blockNumber);
            // }
            this.$router.push("/");
          },
          (dispatchError) => {
            execResultValue(tx);
            this.onTxError(dispatchError);
            this.isLoading = false;
          },
          (res) => this.resolveStatus(res.status, true)
        )
      );
    } catch (e) {
      if (e instanceof Error) {
        showNotification(e.toString(), notificationTypes.danger);
        this.isLoading = false;
      }
    }
  }

  public async constructMeta(): Promise<string> {
    if (!this.nft.file) {
      throw new ReferenceError("No file found!");
    }

    const meta: NFTMetadata = {
      name: this.nft.name,
      description: this.nft.description,
      attributes: [
        ...(this.nft?.tags || []),
        ...nsfwAttribute(this.nft.nsfw),
        ...offsetAttribute(this.hasCarbonOffset),
      ],
      external_url: "https://metarock.network",
      type: this.nft.file.type,
    };

    try {
      const keys: APIKeys = await getKey(this.accountId);
      const fileHash = await pinFileToIPFS(this.nft.file, keys);

      if (!secondaryFileVisible(this.nft.file)) {
        meta.image = unSanitizeIpfsUrl(fileHash);
        meta.image_ar = this.arweaveUpload ? await ipfsToArweave(fileHash) : "";
      } else {
        meta.animation_url = unSanitizeIpfsUrl(fileHash);
        if (this.nft.secondFile) {
          const coverImageHash = await pinFileToIPFS(this.nft.secondFile, keys);
          meta.image = unSanitizeIpfsUrl(coverImageHash);
        }
      }

      revokeKey(keys.pinata_api_key).then(console.log, console.warn);

      // TODO: upload meta to IPFS
      const metaHash = await pinJson(meta);
      return unSanitizeIpfsUrl(metaHash);
    } catch (e) {
      throw new ReferenceError((e as Error).message);
    }
  }

  protected calculateSerialNumber(index: number) {
    return String(index + this.alreadyMinted + 1).padStart(16, "0");
  }

  public async listForSale(remarks: NFT[], originalBlockNumber: string) {
    try {
      const { api } = Connector.getInstance();
      this.isLoading = true;

      const { version } = this;
      const { price } = this.nft;
      showNotification(
        `[APP] Listing NFT to sale for ${formatBalance(price, {
          decimals: this.decimals,
          withUnit: this.unit,
        })}`
      );

      const onlyNfts = remarks

        .map((nft) => ({ ...nft, id: getNftId(nft, originalBlockNumber) }))
        .map((nft) =>
          NFTUtils.createInteraction("LIST", version, nft.id, String(price))
        );

      if (!onlyNfts.length) {
        showNotification("Can not list empty NFTs", notificationTypes.danger);
        return;
      }

      const cb = api.tx.utility.batchAll;
      const args = onlyNfts.map(this.toRemark);

      const tx = await exec(
        this.accountId,
        "",
        cb,
        [args],
        txCb(
          async (blockHash) => {
            execResultValue(tx);
            const header = await api.rpc.chain.getHeader(blockHash);
            const blockNumber = header.number.toString();

            showNotification(
              `[LIST] Saved prices for ${
                onlyNfts.length
              } NFTs with tag ${formatBalance(price, {
                decimals: this.decimals,
                withUnit: this.unit,
              })} in block ${blockNumber}`,
              notificationTypes.success
            );

            this.isLoading = false;
            this.navigateToDetail(remarks[0], originalBlockNumber);
          },
          (dispatchError) => {
            execResultValue(tx);
            this.onTxError(dispatchError);
            this.isLoading = false;
          },
          (res) => this.resolveStatus(res.status)
        )
      );
    } catch (e) {
      showNotification((e as Error).message, notificationTypes.danger);
    }
  }

  protected async estimateTx() {
    this.isLoading = true;
    const { accountId, version } = this;
    const { api } = Connector.getInstance();

    const mint = NFTUtils.createMultipleNFT(
      this.nft.edition,
      this.accountId,
      this.selectedCollection?.symbol || "",
      this.nft.name,
      unSanitizeIpfsUrl(""),
      this.alreadyMinted,
      this.postfix && this.nft.edition > 1 ? basicUpdateFunction : undefined
    );
    const remarks = mint.map((nft) => NFTUtils.encodeNFT(nft, this.version));

    const isSingle =
      remarks.length === 1 && (!this.hasSupport || this.hasCarbonOffset);
    const cb = api.tx.utility.batchAll;

    const args = !this.hasSupport
      ? remarks.map(this.toRemark)
      : [
          ...remarks.map(this.toRemark),
          ...(await this.canSupport()),
          ...(await this.canOffset()),
        ];

    this.estimated = await estimate(this.accountId, cb, [args]);

    this.isLoading = false;
  }

  protected onTxError(dispatchError: DispatchError): void {
    const { api } = Connector.getInstance();
    if (dispatchError.isModule) {
      const decoded = api.registry.findMetaError(dispatchError.asModule);
      const { docs, name, section } = decoded;
      showNotification(
        `[ERR] ${section}.${name}: ${docs.join(" ")}`,
        notificationTypes.danger
      );
    } else {
      showNotification(
        `[ERR] ${dispatchError.toString()}`,
        notificationTypes.danger
      );
    }

    this.isLoading = false;
  }

  protected navigateToDetail(nft: NFT, blockNumber: string) {
    showNotification("You will go to the detail in 2 seconds");
    const go = () =>
      this.$router.push({
        name: "nftDetail",
        params: { id: getNftId(nft, blockNumber) },
        query: { message: "congrats" },
      });
    setTimeout(go, 2000);
  }
}
</script>
