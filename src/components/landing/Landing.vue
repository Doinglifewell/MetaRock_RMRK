<template>
  <section class="hero">
    <div class="hero-body">
      <div class="container">
        <div class="columns level">
          <div class="column level-item has-text-centered">
            <!-- <b-image
              src="/Asset01.png"
              alt="First NFT market explorer on Kusama and Polkadot"
              ratio="6by4"
            /> -->
            <b-carousel>
              <b-carousel-item v-for="(carousel, i) in carousels" :key="i">
                <div class="container">
                  <b-image
                    :src="carousel.src"
                    alt="First NFT market explorer on Kusama and Polkadot"
                    ratio="6by4"
                  />
                </div>
              </b-carousel-item>
            </b-carousel>
          </div>
          <div class="column pl-5">
            <p class="head-text">
              Enabling assets to be teleported into the metaverse
            </p>
            <b-button
              tag="router-link"
              to="/getStarted"
              type="is-inverte"
              class="mt-5"
              >Get Started</b-button
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import nftListWithSearch from "@/queries/nftListWithSearch.graphql";
import { denyList } from "@/constants";
import { getMany, update } from "idb-keyval";
import { fetchNFTMetadata } from "../rmrk/utils";
@Component<Landing>({
  // metaInfo() {
  //   return {
  //     meta: [
  //       { property: 'og:title', content: 'KodaDot - Kusama NFT Market explorer'},
  //       { property: 'og:image', content: this.defaultLandingMetaImage},
  //       { property: 'og:description', content: 'Low carbon NFT gallery on Kusama'},
  //       { property: 'twitter:title', content: 'KodaDot - Kusama NFT Market Explorer' },
  //       { property: 'twitter:description', content: 'Low carbon NFT gallery on Kusama'},
  //       { property: 'twitter:image', content: this.defaultLandingMetaImage},
  //     ]
  //   }
  // },
})
export default class Landing extends Vue {
  public carousels = [
    { src: "/Asset01.png" },
    { src: "/Asset02.png" },
    { src: "/Asset03.png" },
  ];

  public async fetchFirstGalleryPage() {
    const nfts = this.$apollo.query({
      query: nftListWithSearch,
      variables: {
        first: 12,
        offset: 0,
        denyList,
        search: [],
      },
    });

    const {
      data: {
        nFTEntities: { nodes: nftList },
      },
    } = await nfts;

    const storedPromise = getMany(nftList.map(({ metadata }: any) => metadata));

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
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables";
</style>
