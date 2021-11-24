import ApolloClient, { InMemoryCache } from 'apollo-boost'

export const kusamaClient = new ApolloClient({
  // You should use an absolute URL here
  name: 'subquery',
  cache: new InMemoryCache(),
  uri: 'https://api.subquery.network/sq/vikiival/magick'
})

export const crabClient = new ApolloClient({
  // You should use an absolute URL here
  name: 'subquery',
  cache: new InMemoryCache(),
  uri: 'https://api.subquery.network/sq/TopCodeBeast/polkarock_crab_subql'
})

export const pangolinClient = new ApolloClient({
  // You should use an absolute URL here
  name: 'subquery',
  cache: new InMemoryCache(),
  uri: 'https://api.subquery.network/sq/TopCodeBeast/polkarock_pangolin_subql'
})
