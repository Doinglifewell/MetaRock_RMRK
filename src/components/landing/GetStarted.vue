<template>
  <section class="hero">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-mobile">
          <p class="head-text column">Which one are you?</p>
        </div>
        <div class="columns is-mobile">
          <div class="column">
            <b-button tag="router-link" to="/chooseChain" type="is-inverte" class="mr-3 mt-2">Creater</b-button>
            <b-button tag="router-link" to="/exploreChain" type="is-inverte" class="mr-3 mt-2">Collector</b-button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component<GetStarted>({
})
export default class GetStarted extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
