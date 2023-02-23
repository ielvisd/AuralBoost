<template>
  <q-card class="my-card" border-solid border-0 border-b border-blue-900 flat w-full md:w-lg py-2>
    <q-card-section horizontal flex items-center>
      <q-card-section>
        <p my-auto text-xs font-bold> {{ track.stats.rank }}.</p>
      </q-card-section>

      <div class="w-24 my-auto px-4">
        <q-img class="col-5 shadow rounded-full max-w-full h-auto align-middle border-none"
          style="height: 50px; max-width: 50px" :src="`https://berry2.relayx.com/${track.image}`" />
      </div>

      <q-card-section>
        <p my-auto font-bold> {{ track.name }}</p>
      </q-card-section>

      <q-card-section>
        <q-icon v-if="!isPlaying && currentTrack === track || currentTrack !== track"
          @click="$emit('setCurrentTrack', track)" name="play_arrow" />
        <q-icon v-else @click="$emit('setCurrentTrack', track)" name="pause" />
      </q-card-section>

      <q-card-section ml-auto flex justify-center items-center>
        <div w-4 pt-1>
          <img src="https://cdn.cdnlogo.com/logos/b/91/bitcoin-sv.svg">
        </div>

        <p ml-2 my-auto text-xs font-bold> {{ track.stats.vol_total / 100000000 }}</p>
      </q-card-section>

    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { Track } from './models';

interface Props {
  track: Track;
  isPlaying?: boolean;
  currentTrack?: Track;
}
const props = withDefaults(defineProps<Props>(), {
  track: () => { name: '' },
  isPlaying: false,
  currentTrack: () => { name: '' },
});
</script>
