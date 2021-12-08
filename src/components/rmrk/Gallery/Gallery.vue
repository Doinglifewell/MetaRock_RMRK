<template>
  <div class="gallery container">
    <Loader :value="isLoading" />
    <!-- TODO: Make it work with graphql -->
    <Search v-bind.sync="searchQuery" />
    <div>
      <div class="card_outside p-3">
        <b-carousel>
          <b-carousel-item v-for="(carousel, i) in carousels" :key="i">
            <div class="container">
              <b-image
                :src="carousel.src"
                alt="Featured product"
                ratio="3by1"
                class="feature_image"
              />

            </div>
          </b-carousel-item>
        </b-carousel>
        <!-- <img
          src="/Asset01.png"
          alt="current network"
          width="1675"
          height="525"
        /> -->
        <!-- <b-image src="/Asset01.png" alt="Featured product" ratio="4by2" class="feature_image"/>
        <b-image src="/Asset02.png" alt="Featured product" ratio="4by2" class="feature_image"/>
        <b-image src="/Asset03.png" alt="Featured product" ratio="4by2" class="feature_image"/> -->
      </div>
      <div class="columns is-multiline">
        <div class="column is-4" v-for="nft in results" :key="nft.id">
          <div class="card_outside p-5">
            <div class="card nft-card">
              <router-link
                :to="{ name: 'nftDetail', params: { id: nft.id } }"
                tag="div"
                class="nft-card__skeleton"
              >
                <div class="card-image">
                  <span v-if="nft.emoteCount" class="card-image__emotes">
                    <b-icon icon="heart" />
                    <span class="card-image__emotes__count">{{
                      nft.emoteCount
                    }}</span>
                  </span>
                  <!-- <BasicImage
                    :src="nft.image"
                    :alt="nft.name"
                    customClass="gallery__image-wrapper"
                  /> -->
                  <GalleryNewItem :srcId="nft.id" :src="nft.image" />
                  <div class="level mt-5 mb-1">
                    <p class="level-item has-text-centered collection-name">
                      {{ nft.name }}
                    </p>
                  </div>
                  <div class="level">
                    <p class="level-item has-text-centered collection-name">
                      <Money :value="nft.price" inline />
                    </p>
                    <!-- <span v-if="nft.price > 0" class="card-image__price">
                    <Money :value="nft.price" inline />
                  </span> -->
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Pagination
      class="pt-5 pb-5"
      :total="total"
      :perPage="6"
      v-model="currentValue"
      replace
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { NFTWithMeta, NFT, Metadata } from "../service/scheme";
import { fetchNFTMetadata, getSanitizer } from "../utils";
import Freezeframe from "freezeframe";
import "lazysizes";
import { SearchQuery } from "./Search/types";

import nftListWithSearch from "@/queries/nftListWithSearch.graphql";
import { getMany, update } from "idb-keyval";
import { denyList } from "@/constants";

interface Image extends HTMLImageElement {
  ffInitialized: boolean;
}

const controlFilters = [{ name: { notLikeInsensitive: "%Penis%" } }];

type NFTType = NFTWithMeta;
const components = {
  GalleryCardList: () => import("./GalleryCardList.vue"),
  Search: () => import("./Search/SearchBar.vue"),
  Money: () => import("@/components/shared/format/Money.vue"),
  Pagination: () => import("./Pagination.vue"),
  Loader: () => import("@/components/shared/Loader.vue"),
  BasicImage: () => import("@/components/shared/view/BasicImage.vue"),
  GalleryNewItem: () => import("./GalleryNewItem.vue"),
};

@Component<Gallery>({
  metaInfo() {
    return {
      // meta: [
      //   {
      //     property: "og:title",
      //     content: "Low minting fees and carbonless NFTs",
      //   },
      //   {
      //     property: "og:image",
      //     content: this.defaultGalleryMetaImage,
      //   },
      //   {
      //     property: "og:description",
      //     content: "Buy Carbonless NFTs on Kusama",
      //   },
      //   {
      //     property: "twitter:title",
      //     content: "Low minting fees and carbonless NFTs",
      //   },
      //   {
      //     property: "twitter:description",
      //     content: "Buy Carbonless NFTs on Kusama",
      //   },
      //   {
      //     property: "twitter:image",
      //     content: this.defaultGalleryMetaImage,
      //   },
      // ],
    };
  },
  components,
})
export default class Gallery extends Vue {
  private nfts: NFT[] = [];
  private meta: Metadata[] = [];
  private searchQuery: SearchQuery = {
    search: "",
    type: "",
    sortBy: "BLOCK_NUMBER_DESC",
    listed: false,
  };
  private first = 6;
  private placeholder = "/placeholder.png";
  private currentValue = 1;
  private total = 0;
  public carousels = [
    { src: "/Asset01.png" },
    { src: "/Asset02.png" },
    { src: "/Asset03.png" },
  ];

  get defaultGalleryMetaImage(): string {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.hostname}/favicon.png`;
  }

  get isLoading() {
    return this.$apollo.queries.nfts.loading;
  }

  get offset() {
    return this.currentValue * this.first - this.first;
  }

  get exploreChain(): string {
    return this.$store.getters.getCurrentChain;
  }

  public async created() {
    this.$apollo.addSmartQuery("nfts", {
      query: nftListWithSearch,
      manual: true,
      client: this.exploreChain,
      // update: ({ nFTEntities }) => nFTEntities.nodes,
      loadingKey: "isLoading",
      result: this.handleResult,
      variables: () => {
        return {
          first: this.first,
          offset: this.offset,
          denyList,
          orderBy: this.searchQuery.sortBy,
          search: this.buildSearchParam(),
        };
      },
    });
  }

  protected async handleResult({ data }: any) {
    this.total = data.nFTEntities.totalCount;
    this.nfts = data.nFTEntities.nodes.map((e: any) => ({
      ...e,
      emoteCount: e.emotes?.totalCount,
    }));

    const storedMetadata = await getMany(
      this.nfts.map(({ metadata }: any) => metadata)
    );

    storedMetadata.forEach(async (m, i) => {
      if (!m) {
        try {
          const meta = await fetchNFTMetadata(
            this.nfts[i],
            getSanitizer(this.nfts[i].metadata, undefined, "permafrost")
          );
          Vue.set(this.nfts, i, {
            ...this.nfts[i],
            ...meta,
            image: getSanitizer(meta.image || "")(meta.image || ""),
          });
          update(this.nfts[i].metadata, () => meta);
        } catch (e) {
          console.warn("[ERR] unable to get metadata");
        }
      } else {
        Vue.set(this.nfts, i, {
          ...this.nfts[i],
          ...m,
          image: getSanitizer(m.image || "")(m.image || ""),
        });
      }
    });
    this.prefetchPage(this.offset + this.first, this.offset + 3 * this.first);
  }

  public async prefetchPage(offset: number, prefetchLimit: number) {
    try {
      const nfts = this.$apollo.query({
        query: nftListWithSearch,
        client: this.exploreChain,
        variables: {
          first: this.first,
          offset,
          denyList,
          orderBy: this.searchQuery.sortBy,
          search: this.buildSearchParam(),
        },
      });

      const {
        data: {
          nFTEntities: { nodes: nftList },
        },
      } = await nfts;

      const storedPromise = getMany(
        nftList.map(({ metadata }: any) => metadata)
      );

      const storedMetadata = await storedPromise;

      storedMetadata.forEach(async (m, i) => {
        if (!m) {
          try {
            const meta = await fetchNFTMetadata(nftList[i]);
            update(nftList[i].metadata, () => meta);
          } catch (e) {
            console.warn("[ERR] unable to get metadata");
          }
        }
      });
    } catch (e: any) {
      console.warn("[PREFETCH] Unable fo fetch", offset, e.message);
    } finally {
      if (offset <= prefetchLimit) {
        this.prefetchPage(offset + this.first, prefetchLimit);
      }
    }
  }

  private buildSearchParam(): Record<string, unknown>[] {
    const params = [];

    if (this.searchQuery.search) {
      params.push({
        name: { likeInsensitive: `%${this.searchQuery.search}%` },
      });
    }

    if (this.searchQuery.listed) {
      params.push({
        price: { greaterThan: "0" },
      });
    }

    return params;
  }

  get results() {
    // if (this.searchQuery) {
    //   return basicAggQuery(expandedFilter(this.searchQuery, this.nfts))
    // }

    return this.nfts as NFTWithMeta[];

    // return basicAggQuery(expandedFilter(this.searchQuery, this.nfts));
  }

  setFreezeframe() {
    document.addEventListener("lazybeforeunveil", async (e) => {
      const target = e.target as Image;
      const type = target.dataset.type as string;
      const isGif = type === "image/gif";

      if (isGif && !target.ffInitialized) {
        const ff = new Freezeframe(target, {
          trigger: false,
          overlay: true,
          warnings: false,
        });

        target.ffInitialized = true;
      }
    });
  }

  onError(e: Event) {
    const target = e.target as Image;
    target.src = this.placeholder;
  }
}
</script>

<style lang="scss">
.card-image__burned {
  filter: blur(7px);
}

.collection-name {
  font-weight: 600;
  font-size: 21px;
}

.card_outside {
  border: 3px solid #ffffff;
  box-sizing: border-box;
  border-radius: 21px;
}

.gallery {
  @media screen and (max-width: 1023px) {
    padding: 0 15px;
  }

  &__image-wrapper {
    position: relative;
    margin: auto;
    padding-top: 100%;
    overflow: hidden;
    cursor: pointer;
  }

  .card-image img {
    border-radius: 8px;
    top: 50%;
    transition: all 0.3s;
    display: block;
    width: 100%;
    height: auto;
    transform: scale(1);
  }

  .ff-container {
    position: absolute;
    top: 0;
    height: 100%;
    overflow: hidden;

    .ff-overlay {
      z-index: 2;
    }

    .ff-image,
    .ff-canvas {
      top: 50%;
      height: auto;
      transform: translateY(-50%);
      transition: all 0.3s !important;
    }
  }

  .has-text-overflow-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #fff;
  }

  .card-image__emotes__count {
    vertical-align: text-bottom;
  }

  .is-float-right {
    float: right;
  }

  .is-color-pink {
    color: #d32e79;
  }

  .is-absolute {
    position: absolute;
  }

  .nft-collection-counter {
    top: 5px;
    right: -5px;
  }

  .columns {
    padding-top: 10px;

    .card {
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      background: transparent;
      // box-shadow: 0px 0px 10px 0.5px #d32e79;
      filter: drop-shadow(-10px 4px 20px rgba(0, 0, 0, 0.25));
      &-image {
        .ff-canvas {
          border-radius: 8px;
        }

        &__emotes {
          position: absolute;
          background-color: #d32e79;
          border-radius: 4px;
          padding: 3px 8px;
          color: #fff;
          top: 10px;
          right: 10px;
          font-size: 14px;
          z-index: 3;
          transition: all 0.3s;
        }

        &__price {
          position: absolute;
          background-color: #363636;
          border-radius: 4px;
          padding: 3px 8px;
          color: #fff;
          bottom: 10px;
          left: 10px;
          font-size: 14px;
          z-index: 3;
          transition: all 0.3s;
        }
      }

      @media screen and (min-width: 1024px) {
        &-content {
          position: absolute;
          bottom: -45px;
          left: 0;
          width: 100%;
          transition: all 0.3s;
          background: #fff;
          opacity: 0;
        }

        &:hover .card-content {
          bottom: 0;
          opacity: 1;
          z-index: 2;
          background: #000;
        }

        &:hover .gallery__image-wrapper img {
          transform: scale(1.1);
          transition: transform 0.3s linear;
        }

        &:hover .ff-canvas {
          transform: scale(1.1);
        }

        &:hover .card-image__emotes {
          top: 15px;
          right: 15px;
        }

        &:hover .card-image__price {
          bottom: 62px;
        }
      }
    }
  }
}
</style>
