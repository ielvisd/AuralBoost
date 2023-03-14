<template>
  <q-card class="my-card md:w-4/5 mx-auto" border-solid border-0 border-b border-blue-900 flat w-full py-2>
    <q-card-section horizontal flex flex-col md:flex-row items-center justify-between md:no-wrap>

      <!-- Image + Title -->
      <div class="flex items-center justify-between w-full md:w-3/5">
        <!-- Rank if track has difficulty - Make it bold and pink -->
        <div class="flex items-center justify-center">
          <p class="text-sm m-0 font-bold">{{ rank <= ranksWithBoost?.length ? `${rank}.` : '❌.' }}</p>
        </div>
        <div class="w-24 px-4">
          <q-img class="col-5 shadow rounded-full max-w-full h-auto align-middle border-none"
            style="height: 50px; max-width: 50px"
            :src="`https://berry2.relayx.com/${track.image ? track.image : track.icon.berry}`" />
        </div>
        <q-card-section class="flex-1 w-full md:w-2/5">
          <p class="font-bold text-lg">{{ track.name }}</p>
        </q-card-section>
      </div>

      <!-- Stats + Boost Button -->
      <div class="flex items-center justify-between">
          <p class="text-sm m-0"><span class="font-bold">⛏️</span> {{ track.difficulty ?
            track.difficulty.toFixed(4) : 0 }}</p>

        <q-card-section>

          <BoostButton :exchangeRate="exchangeRate" :content="track.origin" :onSuccess="onBoostSuccess" size="sm" round
          :ranks="ranksWithBoost"
            outline>
            <p class="text-xl p-0 m-0">🦚</p>
          </BoostButton>
        </q-card-section>


        <q-card-section class="flex items-center ml-1">
          <q-btn v-if="!isPlaying && currentTrack === track || currentTrack !== track" class="play-btn rounded-full"
            @click="$emit('setCurrentTrack', track)" icon="play_arrow" size="sm" round
            style="background: #FF0080; color: white" />
          <q-btn v-else class="play-btn rounded-full" @click="$emit('setCurrentTrack', track)" icon="pause" size="sm"
            round style="background: #FF0080; color: white" />
        </q-card-section>
      </div>
    </q-card-section>

    <!-- TODO: Extract to it's own component - this is the confirmation dialog -->
    <q-dialog v-model="boostConfirmCard">
      <q-card class="my-card">
        <q-card-section>
          <q-card-section horizontal flex items-center>
            <div class="w-24 my-auto px-4">
              <q-img class="col-5 shadow rounded-full max-w-full h-auto align-middle border-none"
                style="height: 50px; max-width: 50px" :src="`https://berry2.relayx.com/${track.image}`" />
            </div>

            <q-card-section>
              <p my-auto text-lg> Boosted <span font-bold>
                  {{ track.name }}
                </span> successfully!</p>
            </q-card-section>
          </q-card-section>
        </q-card-section>
        <!-- A section with a link to the pow.co page to this txid that opens in a new windo -->
        <q-card-section flex align-center items-center>
          <q-btn mx-auto bg-pink-600 type="a" target="_blank" :href="`https://pow.co/${boostTxid}`">
            <p my-auto font-bold mx-auto text-center>
              See your boosted track at pow.co
            </p>
          </q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { Track } from './models';
import BoostButton from './BoostButton.vue'
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const boostConfirmCard = ref(false);
const boostTxid = ref('');

interface Props {
  track: Track;
  isPlaying?: boolean;
  currentTrack?: Track;
  ranks?: [];
  rank: number;
  exchangeRate?: number;
}

const props = withDefaults(defineProps<Props>(), {
  exchangeRate: 0,
  track: () => { name: '' },
  ranks: () => [],
  rank: 0,
  isPlaying: false,
  currentTrack: () => { name: '' },
});

// Ranks with boost. A computed property that returns an array containing only the tracks that have the property 'difficulty'.
const ranksWithBoost = computed(() => {
  return props.ranks?.filter((track: Track) => track.difficulty);
});

const onBoostSuccess = (response: any) => {
  boostTxid.value = response.txid;;
  boostConfirmCard.value = true;
  $q.loading.hide();
}
</script>

<style scoped>
.stats {
}

.rank {
}
</style>
