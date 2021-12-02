<template>
  <div class="collections container">
    <Loader :value="isLoading" />
    <div v-if="reSelectAccount">
      <div class="hero">
        <div class="hero-body">
          <p class="head-text">Please select your account.</p>
          <AccountSelect
            :label="$i18n.t('Account')"
            v-model="account"
            :tooltipVisible="false"
          />
        </div>
      </div>
    </div>
    <div v-else-if="!isLoading && total == 0">
      <div class="hero">
        <div class="hero-body">
          <p class="head-text">
            You didn't create any collections. Please create collection.
          </p>
          <b-button
            tag="router-link"
            to="/rmrk/createCollection"
            type="is-primary"
            class="mb-5"
            >Create Collection</b-button
          >
        </div>
      </div>
    </div>
    <div v-else>
      <div>
        <p class="head-text column pl-0">Create / Choose Collection</p>
        <b-button
          tag="router-link"
          to="/rmrk/createCollection"
          type="is-primary"
          class="mb-5"
          >Create Collection</b-button
        >
      </div>
      <div>
        <div class="columns is-multiline">
          <div
            class="column is-4"
            v-for="collection in results"
            :key="collection.id"
          >
            <div class="card_outside p-5">
              <router-link
                :to="{ name: 'createNFT', params: { id: collection.id } }"
                tag="div"
                class="collection-card__skeleton"
              >
                <div class="p-1">
                  <div class="card collection-card p-3">
                    <div class="card-image">
                      <BasicImage
                        :src="collection.image"
                        :alt="collection.name"
                        customClass="collection__image-wrapper"
                      />
                    </div>
                    <!-- <div class="card-content">
                    <CollectionDetail
                      :nfts="collection.nfts.nodes"
                      :name="collection.name"
                    />
                  <b-skeleton :active="isLoading"> </b-skeleton>
                </div> -->
                  </div>
                  <div class="level mt-5">
                    <p class="level-item has-text-centered collection-name">
                      {{ collection.name }}
                    </p>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <Pagination
        class="pt-5 pb-5"
        :total="total"
        :perPage="perPage"
        v-model="currentValue"
        replace
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Mixins } from "vue-property-decorator";
import { CollectionWithMeta, Collection, Metadata } from "../service/scheme";
import { fetchCollectionMetadata, sanitizeIpfsUrl } from "../utils";
import Freezeframe from "freezeframe";
import "lazysizes";

import collectionForMintWithSearch from "@/queries/collectionForMintWithSearch.graphql";
import { getMany, update } from "idb-keyval";
import shouldUpdate from "@/utils/shouldUpdate";

interface Image extends HTMLImageElement {
  ffInitialized: boolean;
}

type CollectionType = CollectionWithMeta;
const components = {
  GalleryCardList: () => import("../Gallery/GalleryCardList.vue"),
  Search: () => import("../Gallery/Search/SearchBar.vue"),
  Money: () => import("@/components/shared/format/Money.vue"),
  Pagination: () => import("../Gallery/Pagination.vue"),
  CollectionDetail: () =>
    import("@/components/rmrk/Gallery/CollectionDetail.vue"),
  Loader: () => import("@/components/shared/Loader.vue"),
  BasicImage: () => import("@/components/shared/view/BasicImage.vue"),
  AccountSelect: () => import("@/components/shared/AccountSelect.vue"),
};

@Component<ChooseCollection>({
  metaInfo() {
    return {
      title: "MetaRock - NFT Explorer all collections",
      // meta: [
      //   {
      //     property: "og:title",
      //     content: "Low minting fees and carbonless NFTs",
      //   },
      //   {
      //     property: "og:image",
      //     content: this.defaultCollectionsMetaImage,
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
      //     content: this.defaultCollectionsMetaImage,
      //   },
      // ],
    };
  },
  components,
})
export default class ChooseCollection extends Vue {
  private collections: Collection[] = [];
  private meta: Metadata[] = [];
  private first = 6;
  private perPage = 6;
  private placeholder = "/koda300x300.svg";
  private currentValue = 1;
  private total = 0;
  public reSelectAccount = true;

  get defaultCollectionsMetaImage(): string {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.hostname}/Kodadot_Card_Collections.jpg`;
  }

  get isLoading() {
    return this.$apollo.queries.collection.loading;
  }

  get offset() {
    return this.currentValue * this.first - this.first;
  }

  get accountId() {
    return this.$store.getters.getAuthAddress;
  }
  get createChain(): string {
    return this.$store.getters.getCreateChain;
  }

  set account(account: string) {
    this.$store.dispatch("setAuth", { address: account });
    this.reSelectAccount = false;
  }

  get account() {
    return this.$store.getters.getAuthAddress;
  }
  public async created() {
    const apolloClient = this.createChain;
    if (
      this.$store.getters.getCreateChain ==
      this.$store.getters.getOldCreateChain
    )
      this.reSelectAccount = false;
    else {
      this.$store.dispatch("setOldCreateChain", this.$store.getters.getCreateChain);
    }

    this.$apollo.addSmartQuery("collection", {
      query: collectionForMintWithSearch,
      client: apolloClient,
      manual: true,
      loadingKey: "isLoading",
      result: this.handleResult,
      variables: () => {
        return {
          first: this.first,
          offset: this.offset,
          account: this.accountId,
        };
      },
      update: ({ collectionEntity }) => ({
        ...collectionEntity,
        nfts: collectionEntity.nfts.nodes,
      }),
    });
  }

  protected async handleResult({ data }: any) {
    this.total = data.collectionEntities.totalCount;

    this.collections = data.collectionEntities.nodes.map((e: any) => ({
      ...e,
    }));

    const storedMetadata = await getMany(
      this.collections.map(({ metadata }: any) => metadata)
    );

    storedMetadata.forEach(async (m, i) => {
      if (!m) {
        try {
          const meta = await fetchCollectionMetadata(this.collections[i]);
          Vue.set(this.collections, i, {
            ...this.collections[i],
            ...meta,
            image: sanitizeIpfsUrl(meta.image || ""),
          });
          update(this.collections[i].metadata, () => meta);
        } catch (e) {
          console.warn("[ERR] unable to get metadata");
        }
      } else {
        Vue.set(this.collections, i, {
          ...this.collections[i],
          ...m,
          image: sanitizeIpfsUrl(m.image || ""),
        });
      }
    });

    this.prefetchPage(this.offset + this.first, this.offset + 3 * this.first);
  }

  public async prefetchPage(offset: number, prefetchLimit: number) {
    try {
      const collections = this.$apollo.query({
        query: collectionForMintWithSearch,
        variables: {
          first: this.first,
          offset,
          account: this.accountId,
        },
      });

      const {
        data: {
          collectionEntities: { nodes: collectionList },
        },
      } = await collections;

      const storedPromise = getMany(
        collectionList.map(({ metadata }: any) => metadata)
      );

      const storedMetadata = await storedPromise;

      storedMetadata.forEach(async (m, i) => {
        if (!m) {
          try {
            const meta = await fetchCollectionMetadata(collectionList[i]);
            update(collectionList[i].metadata, () => meta);
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

  get results() {
    return this.collections as CollectionWithMeta[];
  }

  setFreezeframe() {
    document.addEventListener("lazybeforeunveil", async (e) => {
      const target = e.target as Image;
      const type = target.dataset.type as string;
      const isGif = type === "image/gif";

      if (isGif && !target.ffInitialized) {
        new Freezeframe(target, {
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

.card_outside {
  border: 3px solid #ffffff;
  box-sizing: border-box;
  border-radius: 21px;
}

.collection-name {
  font-weight: 600;
  font-size: 21px;
}

.collections {
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

  .collection-collection-counter {
    top: 5px;
    right: -5px;
  }

  .columns {
    padding-top: 10px;

    .card {
      border: 3px solid #ffffff;
      box-sizing: border-box;
      filter: drop-shadow(-10px 4px 20px rgba(0, 0, 0, 0.25));
      border-radius: 21px;
      position: relative;
      overflow: hidden;
      background: transparent;
      // box-shadow: 0px 0px 10px 0.5px #d32e79;

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

      .card-content {
        .heading--inline {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #fff;
        }

        .level-item {
          padding: 0.1rem;
          text-align: left;
          line-height: initial;
        }

        .collection-title {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #fff;
          font-size: 1.5rem;
        }
        .collection-title-class {
          max-width: 100%;
          text-align: center;
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
          padding-left: 1rem;
          padding-right: 1rem;
        }

        &:hover .collection__image-wrapper img {
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
