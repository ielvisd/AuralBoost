<template>
  <q-page class="row items-center justify-evenly">
    <audio-tracks-list @setNewDate="setDateRange" @setSearchText="setSearchText" title="Best selling audio NFTs"
      :tracks="audioNFTs"></audio-tracks-list>
  </q-page>
</template>

<script setup lang="ts">
import { Track } from 'components/models';
import AudioTracksList from 'src/components/AudioTracksList.vue';
import { ref, watch, onBeforeMount } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

// Get the current time in milliseconds since January 1, 1970 (Unix timestamp)
const now = new Date().getTime();
// Calculate the Unix timestamp for 7 days ago (in milliseconds)
const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
// Convert the Unix timestamp to seconds by dividing by 1000
const unixTimestamp = Math.floor(sevenDaysAgo / 1000);

const $q = useQuasar()
const audioNFTs = ref<Track[]>([]);
const dateRange = ref({
  label: 'Last 7 days',
    value: '7d',
    startDate: unixTimestamp ,
    endDate: Date.now()
});
const searchText = ref<string>('');

const setDateRange = (value: object) => {
  dateRange.value = value;
  getAudioRankings(dateRange.value, searchText);
};

const setSearchText = (value: string) => {
  searchText.value = value;
  getAudioRankings(dateRange.value, searchText);
};

const getAudioRankings = async (dateFilter: string, searchFilter: string) => {
  $q.loading.show({
    // delay: 400 // ms
  })

  // Get the audio NFTs ranked by proof of work using the 'sonicboost' tag which corresponds to this: '617564696f2e736f6e6963626f6f7374' and is retrieved from the POWCO API like this: https://pow.co/api/v1/boost/rankings?start_date=1678595639&tag=617564696f2e736f6e6963626f6f7374

  const boost_rankings = await api.get(`https://pow.co/api/v1/boost/rankings?start_date=${dateFilter.startDate}&tag=617564696f2e736f6e6963626f6f7374`)

  console.log('boost_rankings', boost_rankings.data)

  let boostedAudioNFTs: any[] = []
  // Hmm... I think since the rRelay information is always in the third output I can use the Relay API to get the metadata
  for (let i = 0; i < boost_rankings.data.rankings.length; i++) {
    const nft = boost_rankings.data.rankings[i]
    // The relay endpoint looks like this: https://staging-backend.relayx.com/api/market/6b2952d2dc2e868a028d0e3f1d9ee3ad8fc6ab2d2c982244d5c6519132b13748_o3
    const dataFromRelayX = await api.get(`https://staging-backend.relayx.com/api/market/${nft.content_txid}_o3`)
    const tokenFromRelayX = dataFromRelayX.data.data.token
    console.log('tokenFromRelayX', tokenFromRelayX)
    // Add the relay data to audioNFTs
    boostedAudioNFTs.push({...tokenFromRelayX, difficulty: nft.difficulty, stats: {}})
  }


  const { result } = await useQuery(gql`
    query Ranks{
      ranks(
      filter: "${dateFilter.value}",
      category: "AUDIO",
      search: "${searchFilter.value}") {
        name,
        image,
        origin,
        stats {
          rank
          floor
          vol_24h
          vol_7d
          vol_30d
          vol_total
          __typename
      },
        __typename
      }
    }
  `);


  // Combine the audio NFTs from the POWCO API with the audio NFTs from the RelayX API
  if (result?.value?.ranks)
    audioNFTs.value = [...boostedAudioNFTs, ...result?.value?.ranks]
  $q.loading.hide()

  // TODO: I hacked this together late at night, there must be a better way to do this.
  watch(result, (newResult) => {
    // TODO: Loop through newResult.ranks and remove any NFTS that are in the boostedAudioNFTs array so that they aren't shown twice, at the same time add the additional data from the newResult.ranks array that is getting removed to the corresponding NFT in the boostedAudioNFTs array.
    const newAudioNFTs = [...newResult?.ranks]
    for (let i = 0; i < newAudioNFTs.length; i++) {
      const nft = newResult?.ranks[i]
      // console.log('nft', nft)
      // Check if the NFT is in the boostedAudioNFTs array
      const nftIsInBoostedAudioNFTs = boostedAudioNFTs.find((boostedAudioNFT) => boostedAudioNFT.name === nft.name)
      // console.log('nftIsInBoostedAudioNFTs', nftIsInBoostedAudioNFTs)
      if (nftIsInBoostedAudioNFTs) {
        // Add the additional data from the newResult.ranks array that is getting removed to the corresponding NFT in the boostedAudioNFTs array. You have to find the index of the NFT in the boostedAudioNFTs array first.
        const index = boostedAudioNFTs.findIndex((boostedAudioNFT) => boostedAudioNFT.name === nft.name)
        boostedAudioNFTs[index].stats = nft.stats
        // console.log('boostedAudioNFTs[index]', boostedAudioNFTs[index])
        // Remove the NFT from the newResult.ranks array
        newAudioNFTs.splice(i, 1)

      }
    }

    audioNFTs.value = [...boostedAudioNFTs, ...newAudioNFTs]
  });
};

// Get audio NFTs before mount
onBeforeMount(() => {
  getAudioRankings(dateRange.value, searchText);
});
</script>
