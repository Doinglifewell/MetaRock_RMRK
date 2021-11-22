<template>
  <section class="hero">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-mobile">
          <p class="head-text column is-6">Which one are you?</p>
        </div>
        <div class="columns is-mobile">
          <div class="column is-6">
            <b-button tag="router-link" to="/chooseChain" type="is-inverte" class="mr-3 mt-2">Creater</b-button>
            <b-button type="is-inverte" class="mr-3 mt-2">Collector</b-button>
            <b-button type="is-inverte" class="mr-3 mt-2">Both</b-button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Vue } from "vue-property-decorator";

export default class GetStarted extends Vue {}
</script>

<style lang="scss" scoped>
@import "@/styles/variables";
.head-text {
  font-weight: 600;
  font-size: 65px;
}
</style>
