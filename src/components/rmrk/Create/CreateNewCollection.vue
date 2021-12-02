<template>
  <div class="collections container">
    <Loader v-model="isLoading" :status="status" />
    <div>
      <p class="title is-size-3">
        {{ $t("context") }}
      </p>
      <div class="columns">
        <div class="column">
          <p class="collection_head">Collection Cover Image</p>
          <MetadataUpload
            v-model="image"
            label="File Types: PNG, JPEG, GIF, SVG"
            expanded
            preview
            accept="image/png, image/jpeg, image/gif, image/svg+xml, image/svg"
          />
        </div>
        <div class="column">
          <div class="mb-5">
            <p class="collection_label mb-1">
              {{ $t("mint.collection.name.label") }}
            </p>
            <BasicInput
              v-model="rmrkMint.name"
              :message="$t('mint.collection.name.message')"
              :placeholder="$t('mint.collection.name.placeholder')"
              expanded
              spellcheck="true"
            />
          </div>
          <div class="mb-5">
            <p class="collection_label mb-1">
              {{ $t("mint.collection.symbol.label") }}
            </p>
            <BasicInput
              v-model="rmrkMint.symbol"
              :message="$t('mint.collection.symbol.message')"
              :placeholder="$t('mint.collection.symbol.placeholder')"
              @keydown.native.space.prevent
              maxlength="10"
              expanded
            />
          </div>
          <div class="mb-5">
            <p class="collection_label mb-1">
              {{ $t("mint.collection.description.label") }}
            </p>
            <BasicInput
              v-model="meta.description"
              maxlength="500"
              type="textarea"
              spellcheck="true"
              :message="$t('mint.collection.description.message')"
              :placeholder="$t('mint.collection.description.placeholder')"
            />
          </div>

          <b-field>
            <b-switch v-model="unlimited" :rounded="false">
              {{ $t("mint.unlimited") }}
            </b-switch>
          </b-field>
          <b-field
            v-if="!unlimited"
            class="mt-1"
            :label="$i18n.t('Maximum NFTs in collection')"
          >
            <b-numberinput
              v-model="rmrkMint.max"
              placeholder="1 is minumum"
              :min="1"
            ></b-numberinput>
          </b-field>

          <b-field>
            <PasswordInput v-model="password" :account="accountId" />
          </b-field>
          <b-field>
            <b-button
              type="is-primary"
              icon-left="paper-plane"
              @click="submit"
              :disabled="disabled"
              :loading="isLoading"
              outlined
            >
              {{ $t("create collection") }}
            </b-button>
          </b-field>
          <!-- <b-field>
            <Support v-model="hasSupport" :price="filePrice" />
          </b-field> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import { emptyObject } from "@/utils/empty";

import Connector from "@/utils/vue-api2";
import exec, { execResultValue, txCb } from "@/utils/transactionExecutor";
import { notificationTypes, showNotification } from "@/utils/notification";
import SubscribeMixin from "@/utils/mixins/subscribeMixin";
import RmrkVersionMixin from "@/utils/mixins/rmrkVersionMixin";
import { Collection, CollectionMetadata } from "../service/scheme";
import { unSanitizeIpfsUrl } from "@/utils/ipfs";
import { pinJson, pinFileDirect } from "@/proxy";
import { decodeAddress } from "@polkadot/keyring";
import { u8aToHex } from "@polkadot/util";
import { generateId } from "@/components/rmrk/service/Consolidator";
import { supportTx, calculateCost } from "@/utils/support";
import NFTUtils from "../service/NftUtils";
import TransactionMixin from "@/utils/mixins/txMixin";

const components = {
  Auth: () => import("@/components/shared/Auth.vue"),
  MetadataUpload: () => import("./DropUpload.vue"),
  PasswordInput: () => import("@/components/shared/PasswordInput.vue"),
  Tooltip: () => import("@/components/shared/Tooltip.vue"),
  Support: () => import("@/components/shared/Support.vue"),
  Loader: () => import("@/components/shared/Loader.vue"),
  BasicInput: () => import("@/components/shared/form/BasicInput.vue"),
};

@Component({ components })
export default class CreateNewCollection extends Mixins(
  SubscribeMixin,
  RmrkVersionMixin,
  TransactionMixin
) {
  private rmrkMint: Collection = emptyObject<Collection>();
  private meta: CollectionMetadata = emptyObject<CollectionMetadata>();
  // private accountId: string = '';
  private uploadMode = true;
  private image: Blob | null = null;
  private password = "";
  private hasSupport = false;
  protected unlimited = true;

  get accountId() {
    return this.$store.getters.getAuthAddress;
  }

  get rmrkId(): string {
    return generateId(this.accountId, this.rmrkMint?.symbol || "");
  }

  get accountIdToPubKey() {
    return (this.accountId && u8aToHex(decodeAddress(this.accountId))) || "";
  }

  get disabled(): boolean {
    const { name, symbol, max } = this.rmrkMint;
    return !(
      name &&
      symbol &&
      (this.unlimited || max) &&
      this.accountId &&
      this.image
    );
  }

  public constructRmrkMint(metadata: string): Collection {
    const { symbol, name, max } = this.rmrkMint;
    const count = this.unlimited ? 0 : max;
    return NFTUtils.createCollection(
      this.accountId,
      symbol,
      name,
      metadata,
      count
    );
  }

  get filePrice() {
    return calculateCost(this.image);
  }

  public async constructMeta() {
    if (!this.image) {
      throw new ReferenceError("No file found!");
    }

    this.meta = {
      ...this.meta,
      attributes: [],
      external_url: "https://nft.kodadot.xyz",
    };

    // TODO: upload image to IPFS
    const imageHash = await pinFileDirect(this.image);
    this.meta.image = unSanitizeIpfsUrl(imageHash);
    // TODO: upload meta to IPFS
    const metaHash = await pinJson(this.meta);

    return unSanitizeIpfsUrl(metaHash);
  }

  protected async canSupport() {
    if (this.hasSupport && this.image) {
      return [await supportTx(this.image)];
    }

    return [];
  }

  private toRemark(remark: string) {
    const { api } = Connector.getInstance();
    return api.tx.system.remark(remark);
  }

  private async submit() {
    this.isLoading = true;
    this.status = "loader.ipfs";

    try {
      const metadata = await this.constructMeta();
      const mint = this.constructRmrkMint(metadata);
      const mintString = NFTUtils.encodeCollection(mint, this.version);

      const { api } = Connector.getInstance();
      showNotification(mintString);
      const cb = !this.hasSupport
        ? api.tx.system.remark
        : api.tx.utility.batchAll;
      const args = !this.hasSupport
        ? mintString
        : [this.toRemark(mintString), ...(await this.canSupport())];

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
              `[Collection] Saved ${this.rmrkMint.name} in block ${blockNumber}`,
              notificationTypes.success
            );

            this.isLoading = false;
          },
          (dispatchError) => {
            execResultValue(tx);
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                dispatchError.asModule
              );
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
          },
          (res) => this.resolveStatus(res.status)
        )
      );
    } catch (e: any) {
      showNotification(`[ERR] ${e}`, notificationTypes.danger);
      console.error(e);
      this.isLoading = false;
    }
  }
}
</script>
<style lang="scss">
.collection_head {
  font-weight: 600;
  font-size: 22px;
}
.collection_label {
  font-weight: 600;
  font-size: 16px;
}
</style>
