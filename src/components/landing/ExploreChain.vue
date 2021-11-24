<template>
  <section class="hero">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-mobile">
          <p class="head-text column">Choose Chain</p>
        </div>
        <div class="columns is-mobile">
          <div class="column">
            <b-button
              @click="switchExploreChain('kusama')"
              type="is-primary"
              class="mr-3 mt-2"
              >Kusama</b-button
            >
            <b-button
              @click="switchExploreChain('darwinia')"
              type="is-primary"
              class="mr-3 mt-2"
              >Darwinia</b-button
            >
            <b-button
              @click="switchExploreChain('crab')"
              type="is-primary"
              class="mr-3 mt-2"
              >Crab</b-button
            >
            <b-button
              @click="switchExploreChain('pangolin')"
              type="is-primary"
              class="mr-3 mt-2"
              >Pangolin</b-button
            >
            <b-button
              @click="switchExploreChain('moonbeam')"
              type="is-primary"
              class="mr-3 mt-2"
              >Moonbeam</b-button
            >
            <b-button
              @click="switchExploreChain('ethereum')"
              type="is-primary"
              class="mr-3 mt-2"
              >Ethereum</b-button
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component<ExploreChain>({})
export default class ExploreChain extends Vue {
  public switchExploreChain(data: string) {
    console.log("switchExploreChain:", data)
    this.$router.push('/rmrk/collections') 
    this.$store.dispatch("setExploreChain", data);
  }
}
</script>

<style lang="scss" scoped></style>
