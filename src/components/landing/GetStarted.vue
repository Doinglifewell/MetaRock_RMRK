<template>
  <section class="hero">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-mobile">
          <p class="head-text column">
            {{ $t("GetStarted.Which one are you") }}
          </p>
        </div>
        <div class="columns is-mobile">
          <div class="column">
            <b-button
              tag="router-link"
              to="/chooseNFT"
              type="is-inverte"
              class="mr-3 mt-2"
            >
              {{ $t("GetStarted.Creater") }}</b-button
            >
            <b-button
              tag="router-link"
              to="/exploreChain"
              type="is-inverte"
              class="mr-3 mt-2"
            >
              {{ $t("GetStarted.Collecter") }}</b-button
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component<GetStarted>({})
export default class GetStarted extends Vue {}
</script>

<style lang="scss" scoped></style>
