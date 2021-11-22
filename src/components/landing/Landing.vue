<template>

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

    const carousel=  [
                { text: 'Slide 1', color: 'primary' },
                { text: 'Slide 2', color: 'info' },
                { text: 'Slide 3', color: 'success' },
                { text: 'Slide 4', color: 'warning' },
                { text: 'Slide 5', color: 'danger' }
            ]

  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables';

.homepage {
  content: '';
  width: 100%;
  height: 100%;
  color: $text;

  @include desktop {
    background: url('/homepage-bg.jpg') center bottom;
    background-repeat: no-repeat;
    background-size: contain;
  }

  &__title {
    display: inline-flex;
    padding: 16px 32px;
    margin: 0 0 60px;
    text-transform: uppercase;
    border: 4px solid $primary;
  }

  &__heading {
    font-size: 4rem;
    color: $text;
  }

  &__box {
    max-width: 600px;
    padding: 40px 48px;
    margin: 120px 0 132px;
    background-color: $body-background;
    border: 4px solid $primary;
    border-radius: 0;

    @include desktop {
      box-shadow: 28px -28px $black, 28px -28px 0 4px $primary;
    }
  }

  &__box-content {
    max-width: 464px;

    p, .button {
      margin-bottom: 32px;
    }

    p {
      display: flex;
      flex-direction: column;
    }
  }

  &__button {
    &--wrapped {
      height: auto;
      white-space: normal;
    }
  }
}

.subtitle {
  text-decoration: underline;
}

.truncate {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

li {
  list-style-type: square;
}
</style>
