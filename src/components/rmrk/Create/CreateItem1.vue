<template>
  <div class="container">
    <p class="title is-size-3">Create NFT</p>
    <div class="columns">
      <div class="column">
        <div>
          <p class="collection_head mb-1">NFTImage</p>
          <MetadataUpload
            v-model="vFile"
            label="File Types: BMP, GIF, JPEG, PNG, SVG, TIFF, WEBP, MP4, OGV, QUICKTIME, WEBM, GLB, FLAC, MP3, JSON"
            expanded
            preview
          />
        </div>
        <div class="mt-6" v-if="secondaryFileVisible">
          <p class="collection_head mb-1">
            The Cover image for your NFT | Optional
          </p>
          <MetadataUpload
            v-model="vSecondFile"
            icon="file-image"
            label="File Types: JPG, PNG, GIF"
            preview
            accept="image/png, image/jpeg, image/gif"
            expanded
          />
        </div>
      </div>
      <div class="column">
        <div class="mb-5">
          <p class="collection_label mb-1">
            {{ $t("mint.nft.name.label") }}
          </p>
          <BasicInput
            v-model="vName"
            :message="$t('mint.nft.name.message')"
            :placeholder="$t('mint.nft.name.placeholder')"
            expanded
          />
        </div>
        <div class="mb-5">
          <p class="collection_label mb-1">
            {{ $t("mint.nft.description.label") }}
          </p>
          <BasicInput
            v-model="vDescription"
            maxlength="500"
            type="textarea"
            spellcheck="true"
            :message="$t('mint.nft.description.message')"
            :placeholder="$t('mint.nft.description.placeholder')"
          />
        </div>

        <div class="mb-5">
          <p class="collection_label mb-1">
            {{ $t("mint.nft.editions.NoofEditions") }}
          </p>
          <b-numberinput
            v-model="vEdition"
            :placeholder="$t('mint.nft.editions.placeholder')"
            expanded
            :min="1"
            :max="clickableMax"
          ></b-numberinput>
        </div>

        <div class="columns">
          <div class="column">
            <p class="collection_label mb-1">
              {{ $t("mint.nft.tags.name") }}
            </p>
            <AttributeTagInput
              v-model="vTags"
              :placeholder="$t('mint.nft.tags.placeholder')"
            />
          </div>
          <div class="column">
            <p class="collection_label mb-1">
              {{ $t("mint.nft.price") }}
            </p>
            <BalanceInput @input="updateMeta" expanded />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, PropSync } from "vue-property-decorator";
import { Attribute } from "../service/scheme";
import { resolveMedia } from "../utils";
import { isFileWithoutType, isSecondFileVisible } from "./mintUtils";

@Component({
  components: {
    AttributeTagInput: () => import("./AttributeTagInput.vue"),
    BalanceInput: () => import("@/components/shared/BalanceInput.vue"),
    MetadataUpload: () => import("./DropUpload.vue"),
    Tooltip: () => import("@/components/shared/Tooltip.vue"),
    BasicInput: () => import("@/components/shared/form/BasicInput.vue"),
    BasicSwitch: () => import("@/components/shared/form/BasicSwitch.vue"),
  },
})
export default class CreateItem1 extends Vue {
  @PropSync("name", { type: String }) vName!: string;
  @PropSync("description", { type: String }) vDescription!: string;
  @PropSync("edition", { type: Number }) vEdition!: number;
  @PropSync("nsfw", { type: Boolean }) vNsfw!: boolean;
  @PropSync("price", { type: [Number, String] }) vPrice!: string | number;
  @PropSync("tags", { type: Array }) vTags!: Attribute[];
  @PropSync("file", { type: Blob }) vFile!: Blob | null;
  @PropSync("secondFile", { type: Blob }) vSecondFile!: Blob | null;

  @Prop(Number) public max!: number;
  @Prop(Number) public alreadyMinted!: number;

  protected updateMeta(value: number) {
    console.log(typeof value, value);
    this.vPrice = value;
  }

  get fileType() {
    return resolveMedia(this.vFile?.type);
  }

  get secondaryFileVisible(): boolean {
    const fileType = this.fileType;
    return (
      isFileWithoutType(this.vFile, fileType) || isSecondFileVisible(fileType)
    );
  }

  get hasPrice() {
    return Number(this.vPrice);
  }

  get clickableMax() {
    return (this.max || Infinity) - this.alreadyMinted;
  }
}
</script>

<style lang="scss">
.create-token-card {
  margin-bottom: 1em;
}
</style>
