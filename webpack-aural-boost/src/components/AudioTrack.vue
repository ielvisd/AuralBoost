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

      <q-card-section>
        <BoostButton
        :exchangeRate="exchangeRate"
        :content="track.origin"
        :onSuccess="onBoostSuccess"
        size="sm"
        round
        outline>
        <p class="text-xl p-0 m-0">🦚</p>
        </BoostButton>
      </q-card-section>
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
import { ref } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const boostConfirmCard = ref(false);
const boostTxid = ref('');

interface Props {
  track: Track;
  isPlaying?: boolean;
  currentTrack?: Track;
  exchangeRate?: number;
}

const props = withDefaults(defineProps<Props>(), {
  exchangeRate: 0,
  track: () => { name: '' },
  isPlaying: false,
  currentTrack: () => { name: '' },
});

const onBoostSuccess = (response: any) => {
  boostTxid.value = response.txid;;
  boostConfirmCard.value = true;
  $q.loading.hide();
}
</script>
