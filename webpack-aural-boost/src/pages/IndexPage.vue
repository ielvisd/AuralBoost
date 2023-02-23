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

const audioNFTs = ref<Track[]>([]);
const dateRange = ref({
  label: 'Last 7 days',
  value: '7d'
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
  const { result } = useQuery(gql`
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
  audioNFTs.value = result.value?.ranks;

  watch(result, (newResult) => {
    audioNFTs.value = newResult.ranks;
  });
};

// Get audio NFTs before mount
onBeforeMount(() => {
  getAudioRankings(dateRange.value, searchText);
});
</script>
