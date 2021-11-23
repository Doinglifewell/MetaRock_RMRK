<template>
  <section class="hero">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-mobile">
          <p class="head-text column is-6">Choose Chain</p>
        </div>
        <div class="columns is-mobile">
          <div class="column is-6">
            <b-button tag="router-link" :to="{ name: 'createStandard'}" type="is-inverte" class="mr-3 mt-2 chain_button"
              >Kusama</b-button
            >
            <b-button tag="router-link" :to="{ name: 'createStandard'}" type="is-inverte" class="mr-3 mt-2 chain_button"
              >Darwinia</b-button
            >
            <b-button tag="router-link" :to="{ name: 'createStandard'}" type="is-inverte" class="mr-3 mt-2 chain_button"
              >Crab</b-button
            >
            <b-button tag="router-link" :to="{ name: 'createStandard'}" type="is-inverte" class="mr-3 mt-2 chain_button"
              >Moonbeam</b-button
            >
            <b-button tag="router-link" :to="{ name: 'createStandard'}" type="is-inverte" class="mr-3 mt-2 chain_button"
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

@Component<ChooseChain>({
})
export default class ChooseChain extends Vue {}
</script>

<style lang="scss" scoped>
.head-text {
  font-weight: 600;
  font-size: 65px;
}
.chain_button {
  border: none;
  border-radius: 0;
  background-color: transparent !important;
  box-shadow: none;
  position: relative;
  padding: 0 8px;

  &:hover,
  &:focus,
  &:active {
    border: none;
    box-shadow: none;
  }

  &:not(:last-child) {
    &:after {
      content: "";
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 0;
      width: 1px;
      height: 12px;
      background: #fff;
    }
  }
}
</style>
