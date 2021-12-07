import ApolloClient, { InMemoryCache } from 'apollo-boost'

export const Kusama = new ApolloClient({
  name: 'subquery',
  cache: new InMemoryCache(),
  uri: 'https://api.subquery.network/sq/vikiival/magick'
})

export const Crab = new ApolloClient({
  name: 'subquery',
  cache: new InMemoryCache(),
  uri: 'https://api.subquery.network/sq/TopCodeBeast/metarock_crab_subql__VG9wQ'
})

export const Pangolin = new ApolloClient({
  name: 'subquery',
  cache: new InMemoryCache(),
  uri: 'https://api.subquery.network/sq/TopCodeBeast/metarock_pangolin_subql__VG9wQ'
})
