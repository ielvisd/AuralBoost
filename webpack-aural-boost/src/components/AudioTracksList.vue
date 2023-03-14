<template>
  <div min-h-screen>
    <div class="q-pa-md mx-auto" style="max-width: 300px">
      <div class="q-gutter-md">
        <q-input debounce="500" v-model="searchText" label="Search audio tracks" />
        <q-select v-model="dateModel" :options="options" :display-value="`${dateModel ? dateModel.label : '*none*'}`" />
      </div>
    </div>

    <AudioPlayer v-if="currentTrack?.name" @loadedmetadata="playTrack" mt-4 @play="checkIsPlaying" @pause="checkIsPlaying"
      ref="bitcoinAudioPlayer" :option="{
        src: currentTrackLocation,
        title: currentTrack.name,
        coverImage: currentTrackImageLocation,
      }" />

    <p v-if="!tracks.length">No tracks sold during selected timeframe.</p>

    <audio-track @setCurrentTrack="loadAndOrPlayPauseCurrentTrack"
    :ranks="tracks"
    :exchangeRate="exchangeRate"
    :currentTrack="currentTrack" :track="track"
    :isPlaying="isPlaying" v-for="(track, index) in tracks"
    :key="track.origin"
    :rank="index + 1"
    />
  </div>
</template>

<script setup lang="ts">
import AudioTrack from './AudioTrack.vue';
import { Track } from './models';
import { ref, watch, withDefaults, defineProps, onBeforeMount } from 'vue';
import AudioPlayer from 'vue3-audio-player';
import 'vue3-audio-player/dist/style.css';
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const exchangeRate = ref(null)

// TODO: Pass this as a prop instead
onBeforeMount(async () => {
  const exchangeRateResponse = await api.get('https://api.whatsonchain.com/v1/bsv/main/exchangerate')

  // round to w decimals
  exchangeRate.value = exchangeRateResponse.data.rate.toFixed(2)
})

const currentTrack = ref<Track>({
  name: '',
  origin: '',
  image: '',
  stats: {
    rank: 0,
    vol_total: 0,
  },
});
const searchText = ref<string>('');
const currentTrackLocation = ref('');
const currentTrackImageLocation = ref('');
const bitcoinAudioPlayer = ref(AudioPlayer);
const isPlaying = ref(false);
const $q = useQuasar()

const emit = defineEmits<{
  (e: 'setNewDate', newDateModel: object): void,
  (e: 'setSearchText', newSearchText: string): void,
}>()

const dateModel = ref({
  label: 'Last 7 days',
  value: '7d'
})

// Get the current time in milliseconds since January 1, 1970 (Unix timestamp)
const now = new Date().getTime()
// Calculate the Unix timestamp for 7 days ago (in milliseconds)
const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
const oneDayAgo = now - (1 * 24 * 60 * 60 * 1000);
const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
// Convert the Unix timestamp to seconds by dividing by 1000
const unixTimestampSevenDaysAgo = Math.floor(sevenDaysAgo / 1000);
const unixTimestampOneDayAgo = Math.floor(oneDayAgo / 1000);
const unixTimestampThirtyDaysAgo = Math.floor(thirtyDaysAgo / 1000);


const options = [
  {
    label: 'Last 24 hours',
    value: '24h',
    startDate: unixTimestampOneDayAgo,
    endDate: Date.now()
  },
  {
    label: 'Last 7 days',
    value: '7d',
    startDate: unixTimestampSevenDaysAgo,
    endDate: Date.now()
  },
  {
    label: 'Last 30 days',
    value: '30d',
    startDate: unixTimestampThirtyDaysAgo,
    endDate: Date.now()
  },
  {
    label: 'All time',
    value: 'total',
    // Set to BSV genesis block date in Unix format
    startDate: 1231006505,
    endDate: Date.now()
  }
]

watch(searchText, (newSearchText) => {
  emit('setSearchText', newSearchText)
})

// This function will be called when a new date is selected
watch(dateModel, (newDateModel) => {
  emit('setNewDate', newDateModel)
})

const playTrack = () => {
  bitcoinAudioPlayer?.value?.play();
};

const checkIsPlaying = () => {
  bitcoinAudioPlayer.value.isPlaying ? (isPlaying.value = true) : (isPlaying.value = false);
}

// Maybe just a load here
const loadCurrentTrack = (track: Track) => {
  // Handle no sales error
  if (!track) {
    currentTrack.value = {
      name: 'No sales in current range',
      origin: ''
    },
      currentTrackLocation.value = '',
      currentTrackImageLocation.value = 'https://picsum.photos/200';
    return
  }

  $q.loading.show({
    // delay: 400 // ms
  })

  currentTrack.value = track;
  currentTrackImageLocation.value = `https://berry2.relayx.com/${track.image}`;
  const currentTrackLocationFromOrigin = currentTrack.value.origin.replace(
    /.$/,
    '2'
  );
  currentTrackLocation.value = `https://staging-backend.relayx.com/api/berry/${currentTrackLocationFromOrigin}`;

  $q.loading.hide()
};

// This will load a track if it's not already loaded, and play/pause it if it is
const loadAndOrPlayPauseCurrentTrack = (track: Track) => {
  $q.loading.show({
    delay: 400 // ms
  })
  loadCurrentTrack(track);
  if (currentTrack.value?.origin === track.origin && typeof bitcoinAudioPlayer.value.play === 'function') {
    bitcoinAudioPlayer.value.isPlaying
      ? bitcoinAudioPlayer.value.pause()
      : bitcoinAudioPlayer.value.play();
  }
  $q.loading.hide()
};

interface Props {
  tracks?: Track[];
}
const props = withDefaults(defineProps<Props>(), {
  tracks: () => [],
});

watch(currentTrack, (newTrack) => {
  loadAndOrPlayPauseCurrentTrack(newTrack as Track);
});
</script>
