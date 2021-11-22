<template>
  <section class="hero">
    <div class="hero-body ">
      <div class="container">
        <div class="columns level">
          <div class="column level-item has-text-centered">
            <img
              src="/Asset01.png"
              alt="First NFT market explorer on Kusama and Polkadot"
              class="logo__img"
              width="787"
              height="489"
              > 
          </div>
          <div class="column ml-5">
            <p class="head-text">Enabling assets to be teleported into the metaverse</p>
            <b-button type="is-inverte" class="mt-5">Get Started</b-button>
          </div>
        </div>
        <p class="head-text">Explore</p>
        <div class="columns level" style="display: flex;">
          <div class="column level-item has-text-centered" style="align-self: flex-end;">
            <img
              src="/Asset 11.png"
              alt="First NFT market explorer on Kusama and Polkadot"
              class="logo__img"
              width="653"
              height="327"
              > 
            <b-button type="is-primary" class="mt-5">Real World Assets</b-button>
          </div>
          <div class="column level-item has-text-centered" style="align-self: flex-end;">
            <img
              src="/Asset 31.png"
              alt="First NFT market explorer on Kusama and Polkadot"
              class="logo__img"
              width="505"
              height="361"
              > 
            <b-button type="is-primary" class="mt-5">Real World Assets</b-button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import nftListWithSearch from '@/queries/nftListWithSearch.graphql'
import { denyList } from '@/constants'
import { getMany, update } from 'idb-keyval'
import { fetchNFTMetadata } from '../rmrk/utils'

const components = {
  Identity: () => import('@/components/shared/format/Identity.vue'),
}
@Component<Landing>({
  metaInfo() {
    return {
      meta: [
        { property: 'og:title', content: 'KodaDot - Kusama NFT Market explorer'},
        { property: 'og:image', content: this.defaultLandingMetaImage},
        { property: 'og:description', content: 'Low carbon NFT gallery on Kusama'},
        { property: 'twitter:title', content: 'KodaDot - Kusama NFT Market Explorer' },
        { property: 'twitter:description', content: 'Low carbon NFT gallery on Kusama'},
        { property: 'twitter:image', content: this.defaultLandingMetaImage},
      ]
    }
  },
  components
})
export default class Landing extends Vue {
  get defaultLandingMetaImage(): string {
    const url = new URL(window.location.href)
    return (
      `${url.protocol}//${url.hostname}/Kodadot_Card_Standard.jpg`
    )
  }

  // public mounted() {
  //   this.fetchFirstGalleryPage()
  // }

  public async fetchFirstGalleryPage() {
    const nfts = this.$apollo.query({
      query: nftListWithSearch,
      variables: {
        first: 12,
        offset: 0,
        denyList,
        search: []
      }
    })

    const {
      data: { nFTEntities: { nodes: nftList } }
    } = await nfts

    const storedPromise = getMany(
      nftList.map(({ metadata }: any) => metadata)
    )

    const storedMetadata = await storedPromise

    storedMetadata.forEach(async (m, i) => {
      if (!m) {
        try {
          const meta = await fetchNFTMetadata(nftList[i])
          update(nftList[i].metadata, () => meta)
        } catch (e) {
          console.warn('[ERR] unable to get metadata')
        }
      }
    })


  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables';
  .head-text{
    font-weight: 600; 
    font-size: 65px;
  }
</style>
