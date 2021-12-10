<template>
  <div class="card mb-3 mt-5">
    <div class="card-content p-0">
      <div class="columns">
        <b-field class="column is-6 mb-0">
          <img
            :src="exploreChain"
            alt="current network"
            width="300"
            height="80"
          />
        </b-field>
        <b-field class="column is-1 mb-0">
          <b-button tag="router-link" to="/rmrk/gallery" type="is-primary"
            >{{ $t("Explore.SearchBar.nfts")}}</b-button
          >
        </b-field>
        <b-field class="column is-1 mb-0">
          <b-button tag="router-link" to="/rmrk/collections" type="is-inverte"
            >{{ $t("Explore.SearchBar.collections")}}</b-button
          >
        </b-field>
      </div>
      <div class="columns">
        <b-field class="column is-2 mb-0">
          <b-button type="is-primary" @click="toast()"
            >{{ $t("Explore.SearchBar.Physical Asset")}}</b-button
          >
        </b-field>
        <b-field class="column is-2 mb-0">
          <b-button type="is-inverte" @click="toast()">{{ $t("Explore.SearchBar.Digital Asset")}}</b-button>
        </b-field>
        <b-field class="column is-3 mb-0">
          <b-input
            placeholder="Search..."
            type="search"
            v-model="searchQuery"
            icon="search"
            expanded
          >
          </b-input>
        </b-field>
        <!-- <b-field class="column is-3 mb-0">
          <Sort :value="sortBy" @input="updateSortBy" />
        </b-field> -->
      </div>
      <div class="columns level pt-0">
        <div class="column is-8 mb-0">
          <div class="columns">
            <b-button type="is-inverte" class="column chain-button"
              >{{ $t("Explore.SearchBar.Drawings and Paintings")}}</b-button
            >
            <b-button type="is-inverte" class="column chain-button"
              >{{ $t("Explore.SearchBar.Jewellery")}}</b-button
            >
            <b-button type="is-inverte" class="column chain-button"
              >{{ $t("Explore.SearchBar.Fashion")}}</b-button
            >
            <b-button type="is-inverte" class="column chain-button"
              >{{ $t("Explore.SearchBar.Sculpture")}}</b-button
            >
            <b-button type="is-inverte" class="column chain-button"
              >{{ $t("Explore.SearchBar.Architecture")}}</b-button
            >
          </div>
        </div>
        <div class="column level-right is-offset-1 mb-0">
          <div class="level-item myspace-arragne-btn">
            <Sort :value="sortBy" @input="updateSortBy" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import { Debounce } from "vue-debounce-decorator";
import shouldUpdate from "@/utils/shouldUpdate";
import { exist } from "./exist";
import i18n from "@/i18n";

@Component({
  components: {
    Sort: () => import("./SearchSortDropdown.vue"),
    TypeTagInput: () => import("./TypeTagInput.vue"),
    Pagination: () => import("@/components/rmrk/Gallery/Pagination.vue"),
    BasicSwitch: () => import("@/components/shared/form/BasicSwitch.vue"),
  },
})
export default class SearchBar extends Vue {
  @Prop(String) public search!: string;
  @Prop(String) public type!: string;
  @Prop(String) public sortBy!: string;
  @Prop(Boolean) public listed!: boolean;

  protected isVisible = false;

  public mounted(): void {
    exist(this.$route.query.search, this.updateSearch);
    exist(this.$route.query.type, this.updateType);
    exist(this.$route.query.sort, this.updateSortBy);
    exist(this.$route.query.listed, this.updateListed);
  }

  public toast() {
    const msg: string | any = i18n.t("Explore.SearchBar.toast");
    this.$buefy.toast.open({
      duration: 2000,
      message: msg,
      pauseOnHover: true,
      type: "is-white",
      position: "is-top-right",
    });
  }

  get exploreChain(): string {
    return "/" + this.$store.getters.getExploreChain + ".png";
  }

  get vListed(): boolean {
    return this.listed;
  }

  set vListed(listed: boolean) {
    this.updateListed(listed);
  }

  get searchQuery(): string {
    return this.search;
  }

  set searchQuery(value: string) {
    this.updateSearch(value);
  }

  get typeQuery(): string {
    return this.type;
  }

  set typeQuery(value: string) {
    this.updateType(value);
  }

  @Emit("update:listed")
  @Debounce(50)
  updateListed(value: string | boolean): boolean {
    const v = String(value);
    this.replaceUrl(v, "listed");
    return v === "true";
  }

  @Emit("update:type")
  @Debounce(50)
  updateType(value: string): string {
    this.replaceUrl(value, "type");
    return value;
  }

  @Emit("update:sortBy")
  @Debounce(400)
  updateSortBy(value: string): string {
    this.replaceUrl(value, "sort");
    return value;
  }

  @Emit("update:search")
  @Debounce(400)
  updateSearch(value: string): string {
    shouldUpdate(value, this.searchQuery) && this.replaceUrl(value);
    return value;
  }

  @Debounce(100)
  replaceUrl(value: string, key = "search"): void {
    this.$router
      .replace({
        name: String(this.$route.name),
        query: { ...this.$route.query, search: this.searchQuery, [key]: value },
      })
      .catch(console.warn /*Navigation Duplicate err fix later */);
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables";
input[type="search"] {
  background: white;
  color: #2e0ef4;
}

.card {
  box-shadow: none;
  background: transparent;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.myspace-arragne-btn {
  @include desktop {
    margin-left: auto;
  }
}
</style>
