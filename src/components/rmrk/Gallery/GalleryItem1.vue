<template>
  <div class="wrapper no-padding-desktop gallery-item">
    <div class="container">
      <div class="columns">
        <div class="image-wrapper">
          <div class="column has-text-centered" v-if="!isLoading && meta.image">
            <b-image
              :src="meta.image || '/placeholder.png'"
              src-fallback="/placeholder.png'"
              alt="MetaRock NFT minted multimedia"
              ratio="1by1"
              @error="onImageError"
            ></b-image>
            <!-- <img
                class="fullscreen-image"
                :src="meta.image || '/placeholder.png'"
                alt="MetaRock NFT minted multimedia"
              />
              <b-skeleton
                height="524px"
                size="is-large"
                :active="isLoading"
              ></b-skeleton> -->
          </div>
          <div
            class="column has-text-centered image is-1by1"
            v-if="!meta.image && meta.animation_url"
          >
            <MediaResolver1
              :class="{ withPicture: imageVisible, 'has-ratio': true }"
              :src="meta.animation_url"
              :mimeType="mimeType"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { NFT, NFTMetadata, Emote } from "../service/scheme";
import { sanitizeIpfsUrl, resolveMedia, getSanitizer } from "../utils";
import { emptyObject } from "@/utils/empty";

import AvailableActions from "./AvailableActions.vue";
import { notificationTypes, showNotification } from "@/utils/notification";

import isShareMode from "@/utils/isShareMode";
import nftById from "@/queries/nftById.graphql";
import { fetchNFTMetadata } from "../utils";
import { get, set } from "idb-keyval";
import { MediaType } from "../types";
import axios from "axios";
import { exist } from "./Search/exist";
import Orientation from "@/directives/DeviceOrientation";

@Component<GalleryItem1>({
  metaInfo() {
    const image = `https://og-image-green-seven.vercel.app/${encodeURIComponent(
      this.nft.name as string
    )}.png?price=${
      Number(this.nft.price)
        ? Vue.filter("formatBalance")(this.nft.price, 12, "KSM")
        : ""
    }&image=${this.meta.image as string}`;
    return {
      title: this.nft.name,
      titleTemplate: "%s | Low Carbon NFTs",
      meta: [
        { name: "description", content: this.meta.description as string },
        { property: "og:title", content: this.nft.name as string },
        {
          property: "og:description",
          content: this.meta.description as string,
        },
        { property: "og:image", content: image },
        { property: "og:video", content: this.meta.image as string },
        { property: "og:author", content: this.nft.currentOwner as string },
        { property: "twitter:title", content: this.nft.name as string },
        {
          property: "twitter:description",
          content: this.meta.description as string,
        },
        { property: "twitter:image", content: image },
      ],
    };
  },
  components: {
    Auth: () => import("@/components/shared/Auth.vue"),
    AvailableActions: () => import("./AvailableActions.vue"),
    Facts: () => import("@/components/rmrk/Gallery/Item/Facts.vue"),
    // MarkdownItVueLight: MarkdownItVueLight as VueConstructor<Vue>,
    History: () => import("@/components/rmrk/Gallery/History.vue"),
    HistoryPriceChart: () =>
      import("@/components/rmrk/Gallery/HistoryPriceChart.vue"),
    Money: () => import("@/components/shared/format/Money.vue"),
    Name: () => import("@/components/rmrk/Gallery/Item/Name.vue"),
    Sharing: () => import("@/components/rmrk/Gallery/Item/Sharing.vue"),
    Appreciation: () => import("./Appreciation.vue"),
    MediaResolver1: () => import("../Media/MediaResolver1.vue"),
    // PackSaver: () => import('../Pack/PackSaver.vue'),
    IndexerGuard: () => import("@/components/shared/wrapper/IndexerGuard.vue"),
    VueMarkdown: () => import("vue-markdown-render"),
    Detail: () => import("@/components/rmrk/Gallery/Item/Detail.vue"),
  },
  directives: {
    orientation: Orientation,
  },
})
export default class GalleryItem1 extends Vue {
  @Prop({ type: String }) public srcId!: string;
  @Prop({ type: String }) public src!: string;
  private id = "";
  // private accountId: string = '';
  private passsword = "";
  private nft: NFT = emptyObject<NFT>();
  private imageVisible = true;
  private viewMode = "default";
  private isFullScreenView = false;
  public isLoading = true;
  public mimeType = "";
  public meta: NFTMetadata = emptyObject<NFTMetadata>();
  public emotes: Emote[] = [];
  public message = "";

  get accountId(): string {
    return this.$store.getters.getAuthAddress;
  }

  get exploreChain(): string {
    return this.$store.getters.getExploreChain;
  }

  public async created(): Promise<void> {
    this.checkId();
    const apolloClient = this.exploreChain;
    exist(this.$route.query.message, (val) => {
      this.message = val === "congrats" ? val : "";
      this.$router.replace({ query: null } as any);
    });
    try {
      this.$apollo.addSmartQuery("nft", {
        query: nftById,
        client: apolloClient,
        variables: {
          id: this.id,
        },
        update: ({ nFTEntity }) => ({
          ...nFTEntity,
          emotes: nFTEntity?.emotes?.nodes,
        }),
        result: () => this.fetchMetadata(),
        pollInterval: 3500,
      });
    } catch (e) {
      showNotification(`${e}`, notificationTypes.warn);
    }

    this.isLoading = false;
  }

  onImageError(e: any): void {
    console.warn("Image error", e);
  }

  public async fetchMetadata() {
    if (this.nft["metadata"] && !this.meta["image"]) {
      const m = await get(this.nft.metadata);

      const meta = m
        ? m
        : await fetchNFTMetadata(
            this.nft,
            getSanitizer(this.nft.metadata, undefined, "permafrost")
          );

      const imageSanitizer = getSanitizer(meta.image);
      this.meta = {
        ...meta,
        image: imageSanitizer(meta.image),
        animation_url: sanitizeIpfsUrl(
          meta.animation_url || meta.image,
          "pinata"
        ),
      };

      // console.log(this.meta)
      if (this.meta.animation_url && !this.mimeType) {
        const { headers } = await axios.head(this.meta.animation_url);
        this.mimeType = headers["content-type"];
        // console.log(this.mimeType)
        const mediaType = resolveMedia(this.mimeType);
        this.imageVisible = ![
          MediaType.VIDEO,
          MediaType.MODEL,
          MediaType.IFRAME,
          MediaType.OBJECT,
        ].some((t) => t === mediaType);
      }

      if (!m) {
        set(this.nft.metadata, meta);
      }
    }
  }

  public checkId(): void {
    // if (this.$route.params.id) {
    //   this.id = this.$route.params.id
    // }
    this.id = this.srcId;
  }

  public toggleView(): void {
    this.viewMode = this.viewMode === "default" ? "theatre" : "default";
  }

  public toggleFullScreen(): void {
    this.isFullScreenView = !this.isFullScreenView;
  }

  public minimize(): void {
    this.isFullScreenView = false;
  }

  public toast(message: string): void {
    this.$buefy.toast.open(message);
  }

  get hasPrice() {
    return Number(this.nft.price) > 0;
  }

  get nftId() {
    const { id } = this.nft;
    return id;
  }

  get detailVisible() {
    return !isShareMode;
  }

  protected handleAction(deleted: boolean) {
    if (deleted) {
      showNotification("INSTANCE REMOVED", notificationTypes.warn);
    }
  }

  protected handleUnlist() {
    // call unlist function from the AvailableActions component
    (this.$refs.actions as AvailableActions).unlistNft();
  }
}
</script>

<style lang="scss">
@import "@/styles/variables";

hr.comment-divider {
  border-top: 1px solid lightpink;
  border-bottom: 1px solid lightpink;
}

.gallery-item {
  .nft-title {
    margin-bottom: 24px;
  }

  .gallery-item__skeleton {
    width: 95%;
    margin: auto;
  }

  .image-wrapper {
    position: relative;
    // margin: 30px auto;
    width: 100%;

    // .image {
    //   border: 2px solid $primary;
    // }

    .fullscreen-image {
      display: none;
    }

    .image-preview {
      &.fullscreen {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 999998;
        background: #000;

        img.fullscreen-image {
          display: block;
          object-fit: contain;
          width: 100%;
          height: 100%;
          overflow: auto;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translate(-50%, 0);
          overflow-y: hidden;
        }

        .image {
          visibility: hidden;
        }
      }
    }

    .column {
      transition: 0.3s all;
    }

    button {
      border: 2px solid $primary;
      color: #fff;
      font-weight: bold;
      text-transform: uppercase;
      padding: 7px 16px;
      font-size: 20px;
      background: $scheme-main;
      z-index: 2;

      &:hover {
        background: $primary;
        cursor: pointer;
      }
    }
  }

  button#theatre-view {
    position: absolute;
    top: 13px;
    left: 13px;
    color: $light-text;
    @media screen and (max-width: 768px) {
      display: none;
    }
  }

  button#fullscreen-view {
    position: absolute;
    bottom: 13px;
    right: 13px;

    &.fullscreen {
      position: fixed;
      z-index: 999998;
      bottom: 0;
      right: 0;
    }
  }

  .price-block {
    border: 2px solid $primary;
    padding: 14px;

    &__original {
      font-size: 24px;
      text-transform: uppercase;
      font-weight: 500;
    }

    &__container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__exchange {
      opacity: 0.6;
      color: $dark;
      margin: 0;
    }
  }

  .card {
    border-radius: 0 !important;
    box-shadow: none;
    border: 2px solid $primary;

    &-header {
      border-radius: 0;
      position: relative;

      &:before {
        content: "";
        width: 100%;
        height: 2px;
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        // background: $primary;
      }

      &-title {
        color: $scheme-invert;
      }
    }

    &-content {
      padding-left: 1rem;
      padding-top: 1rem;
    }

    &-footer {
      &-item {
        padding: 0.75rem !important;
      }
    }
  }

  &.no-padding-desktop {
    @media screen and (min-width: 1023px) {
      padding: 0;
    }
  }
}
</style>
