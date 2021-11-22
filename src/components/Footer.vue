<template>
  <footer class="footer">
    <div class="container footer__wrapper">
      <ul class="footer__list">
        <li
          v-for="item in menu"
          :key="item.name"
          class="footer__list-item"
          type="is-white"
        >
          <router-link
            :to="item.url"
          >
            {{ item.name }}
          </router-link>
        </li>
      </ul>
      <div class="icons">
        <ul class="footer__list icons__list">
          <li class="icons__list-item">
            <a
              href="https://t.me/PolkaRock"
              target="_blank"
              rel="noopener noreferrer"
            >
              <b-icon
                pack="fab"
                icon="telegram"
                size="is-medium"
                type="is-white"
              >
              </b-icon>
            </a>
          </li>
          <li class="icons__list-item">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
            >
              <b-icon
                pack="fab"
                icon="twitter"
                size="is-medium"
                type="is-white"
              >
              </b-icon>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import i18n from '@/i18n'
import { TranslateResult } from 'vue-i18n/types'

interface Menu {
  name: TranslateResult;
  url: string;
}
@Component({
  components: {}
})
export default class Footer extends Vue {
  public menu: Menu[] = [
    {
      name: i18n.t('© 2021 Polka Rock'),
      url: '/'
    },
    {
      name: i18n.t('Privacy Policy'),
      url: '/'
    },
    {
      name: i18n.t('Privacy Policy'),
      url: '/'
    }
  ]
}
</script>

<style lang="scss">
@import '@/styles/variables';

.footer {
  &__wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    padding: 16px;
    height: 135px;

    @include desktop {
      flex-direction: row;
    }
  }

  &__list {
    display: flex;
    align-items: center;
    list-style: none;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__list-item {
    position: relative;
    padding: 0 8px;

    &:not(:last-child) {
      &:after {
        content: '';
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
}

.icons {
  &__list-item {
    padding: 0 2px;
  }
}
</style>
