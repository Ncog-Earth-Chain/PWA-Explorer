import Vue from 'vue';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import VueApollo from 'vue-apollo';
import appConfig from '../../../app.config.js';
import { FApolloClient } from './FApolloClient.js';

export const ncogearthchainFApolloClient = new FApolloClient({
    apolloProviders: appConfig.apollo.providers,
    defaultProviderIndex: appConfig.apollo.defaultProviderIndex,
});

export const testFApolloClient = new FApolloClient({
    apolloProviders: [{http: 'http://xapi28.ncogchain.earth:16761/api'}],
    defaultProviderIndex: appConfig.apollo.defaultProviderIndex,
});


export const ncogearthchainApolloClient = new ApolloClient({
    link: ApolloLink.from([
        ncogearthchainFApolloClient.getNetErrorLink(),
        ncogearthchainFApolloClient.getRetryLink(),
        ncogearthchainFApolloClient.getErrorLink(),
        ncogearthchainFApolloClient.getHttpLink(),
    ]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
});

export const testApolloClient = new ApolloClient({
    link: ApolloLink.from([
        testFApolloClient.getNetErrorLink(),
        testFApolloClient.getRetryLink(),
        testFApolloClient.getErrorLink(),
        testFApolloClient.getHttpLink(),
    ]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
});


Vue.use(VueApollo);

export const apolloProvider = new VueApollo({
    clients: {
        ncogearthchain: ncogearthchainApolloClient,
        test: testApolloClient,
    },
    defaultClient: ncogearthchainApolloClient,
    defaultOptions: {
        $query: {
            fetchPolicy: 'network-only', // 'cache-and-network', 'network-only', 'cache-first'
        },
    },
});
