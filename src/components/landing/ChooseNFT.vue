<template>
  <section class="hero">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-mobile">
          <p class="head-text column">What would you like to create ?</p>
        </div>
        <div class="columns is-mobile">
          <div class="column">
            <b-button type="is-primary " class="mr-3 mt-2">Simple NFT</b-button>
            <b-button type="is-primary " class="mr-3 mt-2"
              >Advanced NFT</b-button
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component<ChooseNFT>({})
export default class ChooseNFT extends Vue {}
</script>

<style lang="scss" scoped>
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
