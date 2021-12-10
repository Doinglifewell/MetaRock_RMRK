<template>
  <section class="hero">
    <div class="hero-body">
      <div class="container">
        <div class="columns">
          <div class="column is-3">
            <img
              src="/profileAlt.png"
              alt="First NFT market explorer"
              class="logo__img"
              width="300"
              height="300"
            />
          </div>
          <div class="column is-9">
            <p class="profile-text">Name</p>
            <p class="profile-text">Contact and Socials</p>
            <p class="mt-5" style="font-size: 20px">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.
            </p>
          </div>
        </div>
        <div class="columns mt-6">
          <b-field class="column is-2 mb-0">
            <b-button type="is-primary" @click="toast()"
              >Physical Assets</b-button
            >
          </b-field>
          <b-field class="column is-2 mb-0">
            <b-button type="is-inverte" @click="toast()"
              >Digital Assets</b-button
            >
          </b-field>
        </div>
        <div class="columns level">
          <div class="column is-8 mb-0">
            <div class="columns">
              <b-button type="is-inverte" class="column chain-button"
                >Drawings and Paintings</b-button
              >
              <b-button type="is-inverte" class="column chain-button"
                >Jewellery</b-button
              >
              <b-button type="is-inverte" class="column chain-button"
                >Fashion</b-button
              >
              <b-button type="is-inverte" class="column chain-button"
                >Sculpture</b-button
              >
              <b-button type="is-inverte" class="column chain-button"
                >Architecture</b-button
              >
            </div>
          </div>
          <div class="column level-right is-offset-2 mb-0">
            <b-button class="level-item myspace-arragne-btn" type="is-primary"
              >Arrange Space</b-button
            >
          </div>
        </div>
        <div
          class="columns"
          style="
            filter: drop-shadow(-10px 4px 20px rgba(0, 0, 0, 0.25));
            border-radius: 15px;
          "
        >
          <img
            src="/myspace1.png"
            alt="First NFT market explorer"
            class="logo__img"
            width="1600"
            height="400"
          />
        </div>
        <div class="columns mt-6 level">
          <div class="column is-2 mb-0">
            <p style="font-size: 20px; font-weight: 600">Physical Assets</p>
          </div>
          <div class="column is-3 mb-0">
            <p style="font-size: 20px">Drawings and Paintings</p>
          </div>
          <div class="column level-right is-offset-5 mb-0">
            <b-button type="is-primary" class="level-item myspace-arragne-btn"
              >Arrange Space</b-button
            >
          </div>
        </div>
        <div
          class="columns"
          style="
            background: #5d45c0;
            box-shadow: -10px 4px 20px rgba(0, 0, 0, 0.25);
            border-radius: 15px;
          "
        >
          <div class="column is-one-fifth">
            <img
              src="/myspace2.png"
              alt="First NFT market explorer"
              width="261"
              height="362"
              style="border-radius: 20px"
            />
            <p class="myspace-item-text">Name</p>
            <p class="myspace-item-text">Collection Name</p>
            <p class="myspace-item-text">Price</p>
          </div>
          <div class="column is-one-fifth">
            <img
              src="/myspace2.png"
              alt="First NFT market explorer"
              width="261"
              height="362"
              style="border-radius: 20px"
            />
            <p class="myspace-item-text">Name</p>
            <p class="myspace-item-text">Collection Name</p>
            <p class="myspace-item-text">Price</p>
          </div>
          <div class="column is-one-fifth">
            <img
              src="/myspace2.png"
              alt="First NFT market explorer"
              width="261"
              height="362"
              style="border-radius: 20px"
            />
            <p class="myspace-item-text">Name</p>
            <p class="myspace-item-text">Collection Name</p>
            <p class="myspace-item-text">Price</p>
          </div>
          <div class="column is-one-fifth">
            <img
              src="/myspace2.png"
              alt="First NFT market explorer"
              width="261"
              height="362"
              style="border-radius: 20px"
            />
            <p class="myspace-item-text">Name</p>
            <p class="myspace-item-text">Collection Name</p>
            <p class="myspace-item-text">Price</p>
          </div>
          <div class="column is-one-fifth">
            <img
              src="/myspace2.png"
              alt="First NFT market explorer"
              width="261"
              height="362"
              style="border-radius: 20px"
            />
            <p class="myspace-item-text">Name</p>
            <p class="myspace-item-text">Collection Name</p>
            <p class="myspace-item-text">Price</p>
          </div>
        </div>
        <div class="columns mt-6 level">
          <div class="column is-2 mb-0">
            <p style="font-size: 20px; font-weight: 600">Physical Assets</p>
          </div>
          <div class="column is-3 mb-0">
            <p style="font-size: 20px">Drawings and Paintings</p>
          </div>
          <div class="column level-right is-offset-6 mb-0">
            <b-button class="level-item myspace-arragne-btn" type="is-primary"
              >View All</b-button
            >
          </div>
        </div>
        <div
          class="columns"
          style="
            background: #5d45c0;
            box-shadow: -10px 4px 20px rgba(0, 0, 0, 0.25);
            border-radius: 15px;
          "
        >
          <div class="column is-one-fifth">
            <img
              src="/myspace2.png"
              alt="First NFT market explorer"
              width="261"
              height="362"
              style="border-radius: 20px"
            />
            <p class="myspace-item-text">Name</p>
            <p class="myspace-item-text">Collection Name</p>
            <p class="myspace-item-text">Price</p>
          </div>
          <div class="column is-one-fifth">
            <img
              src="/myspace2.png"
              alt="First NFT market explorer"
              width="261"
              height="362"
              style="border-radius: 20px"
            />
            <p class="myspace-item-text">Name</p>
            <p class="myspace-item-text">Collection Name</p>
            <p class="myspace-item-text">Price</p>
          </div>
          <div class="column is-one-fifth">
            <img
              src="/myspace2.png"
              alt="First NFT market explorer"
              width="261"
              height="362"
              style="border-radius: 20px"
            />
            <p class="myspace-item-text">Name</p>
            <p class="myspace-item-text">Collection Name</p>
            <p class="myspace-item-text">Price</p>
          </div>
          <div class="column is-one-fifth">
            <img
              src="/myspace2.png"
              alt="First NFT market explorer"
              width="261"
              height="362"
              style="border-radius: 20px"
            />
            <p class="myspace-item-text">Name</p>
            <p class="myspace-item-text">Collection Name</p>
            <p class="myspace-item-text">Price</p>
          </div>
          <div class="column is-one-fifth">
            <img
              src="/myspace2.png"
              alt="First NFT market explorer"
              width="261"
              height="362"
              style="border-radius: 20px"
            />
            <p class="myspace-item-text">Name</p>
            <p class="myspace-item-text">Collection Name</p>
            <p class="myspace-item-text">Price</p>
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
@Component<MySpace>({})
export default class MySpace extends Vue {
  public toast() {
    const msg: string | any = "We are still building.";
    this.$buefy.toast.open({
      duration: 2000,
      message: msg,
      pauseOnHover: true,
      type: "is-white",
      position: "is-top-right",
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables";
.profile-text {
  font-size: 40px;
}
.myspace-item-text {
  font-size: 20px;
}

.myspace-arragne-btn {
  @include desktop {
    margin-left: auto;
  }
}
</style>
