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

    <audio-track @setCurrentTrack="loadAndOrPlayPauseCurrentTrack" :currentTrack="currentTrack" :track="track"
      :isPlaying="isPlaying" v-for="track in tracks" :key="track.origin" />
  </div>
</template>

<script setup lang="ts">
import AudioTrack from './AudioTrack.vue';
import { Track } from './models';
import { ref, watch, withDefaults, defineProps } from 'vue';
import AudioPlayer from 'vue3-audio-player';
import 'vue3-audio-player/dist/style.css';
import { useQuasar } from 'quasar'

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
const options = [
  {
    label: 'Last 24 hours',
    value: '24h'
  },
  {
    label: 'Last 7 days',
    value: '7d'
  },
  {
    label: 'Last 30 days',
    value: '30d'
  },
  {
    label: 'All time',
    value: 'total'
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
  console.log('track is', track)
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
  console.log('track is', track)
  $q.loading.show({
    delay: 400 // ms
  })
  loadCurrentTrack(track);
  console.log('currentTrack is', currentTrack.value)
  console.log('bitcoinAudioPlayer is', bitcoinAudioPlayer?.value, currentTrack.value?.origin === track.origin && bitcoinAudioPlayer.value.currentTime > 0)
  console.log('currentTrack.value?.origin === track.origin', currentTrack.value?.origin === track.origin)
  console.log(currentTrack.value?.origin === track.origin && bitcoinAudioPlayer.value.play !== undefined)

  console.log(currentTrack.value?.origin === track.origin && bitcoinAudioPlayer?.value)
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
