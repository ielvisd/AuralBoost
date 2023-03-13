<template>
  <component :is="buttonType"
    class="pulse font-medium flex items-center cursor-pointer border shadow hover:shadow-lg focus:outline-none focus:shadow-outline"
    :href="href" :type="type" :class="btnClasses" @click="() => showSuperBoost = true">
    <slot />
    <q-dialog v-model="showSuperBoost" position="bottom">
      <q-card class="q-pa-md w-full md:w-md boostpow-dialog text-center">
        <div class="flex items-center mb-4">
          <span class="pulse font-medium flex items-center cursor-pointer border shadow hover:shadow-lg focus:outline-none focus:shadow-outline text-3xl">🦚</span>
          <div class="ml-2 text-lg font-medium font-bolder">Boostpow</div>
        </div>
        <div class="mb-4 w-36 mx-auto">
          <label class="block mb-1 font-medium">Tag</label>
          <q-input v-model="tag" outlined class="rounded-md" />
        </div>
        <div class="mb-4 w-36 mx-auto">
          <label class="block mb-1 font-medium">Difficulty</label>
          <q-input min=0.0001
          step=0.0005 v-model.number="difficulty" outlined type="number" class="rounded-md"
          :rules="[val => val < 0.0001 || 'Minimum difficulty is 0.00001']"
          />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Boost Speed {{boostSpeed}}</label>
          <div class="flex justify-center items-center">
            <span class="text-gray-500 text-lg">🐢</span>
            <q-slider v-model.number="boostSpeed" :min="1" :max=100 class="mx-4 w-7/10" />
            <span class="text-gray-500 text-lg">🐇</span>
          </div>
        </div>

        <q-btn @click="boost" v-if="totalPriceInUSD >= 0.01" class="mb-4" :label="`Buy Boost $${  totalPriceInUSD} `" color="primary" />

        <q-btn @click="boost" v-else class="mb-4" :label="`Buy Boost ${ totalPriceInSatoshis} satoshis`" color="primary" />

        <div class="text-gray-500 text-sm">*developer fee: 10%</div>
      </q-card>
    </q-dialog>
  </component>
</template>
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { computed, inject, ref, watch } from 'vue'
import { wrapRelayx } from 'stag-relayx'
import { useQuasar } from 'quasar'

const props = defineProps({
  exchangeRate: {
    type: Number,
    default: 0,
  },
  href: {
    required: false,
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: 'button', // button, submit
  },
  content: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    default: null,
  },
  onSending: {
    type: Function,
    default: null,
  },
  onSuccess: {
    type: Function,
    default: null,
  },
  onError: {
    type: Function,
    default: null,
  },
  onClick: {
    type: Function,
    default: null,
  },
  id: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
  },
  outline: Boolean,
  icon: Boolean,
  round: Boolean,
})

const defaultPricePerDifficulty = 2.18
const boostSpeed = ref(50)

const showSuperBoost = ref(false);
const $q = useQuasar()

// If the content has a difficulty level don't set a tag, otherwise set the tag to 'audio.sonicboost'
const tag = ref(props.tag || (props.content.includes('difficulty') ? null : 'audio.sonicboost'))
const difficulty = ref(0.00025)

const totalPriceInUSD = ref<number>(defaultPricePerDifficulty*difficulty.value + (defaultPricePerDifficulty * difficulty.value * boostSpeed.value / 100) * 1.1)

const totalPriceInSatoshis = computed<number>(() => (totalPriceInUSD.value * 1e8 / props.exchangeRate).toFixed(0))

const devFee = computed<number>(() => (totalPriceInSatoshis.value * 0.1))

watch ([difficulty, boostSpeed], ([newDifficulty, newBoostSpeed]) => {
  totalPriceInUSD.value = defaultPricePerDifficulty*newDifficulty + (defaultPricePerDifficulty * newDifficulty * newBoostSpeed / 100) * 1.1
})

const colorClasses = computed(() => {
  const baseClasses = 'bg-pink-600 text-pink-100 border-pink-600 hover:bg-pink-700 hover:border-pink-700 hover:text-white'
  const outlineClasses = 'border-pink bg-white text-pink hover:bg-pink-200 hover:border-pink hover:text-white'
  return props.outline ? outlineClasses : baseClasses
})
const sizeClasses = computed(() => {
  const isIcon = props.icon
  // NOTE: Add more size properties here if necessary
  const sizeMappings = {
    md: `h-10 ${isIcon ? 'px-3' : 'px-4'}`,
  }
  return sizeMappings[props.size as keyof typeof sizeMappings] || sizeMappings.md
})
const btnClasses = computed(() => {
  const borderRadiusClasses = props.round ? 'rounded-full' : 'rounded'
  return `${colorClasses.value} ${sizeClasses.value} ${borderRadiusClasses}`
})
const buttonType = computed(() => {
  if (props.href)
    return 'a'
  else
    return 'button'
})
// To get the injected content from plugin initialization
// TODO: Make the other props available as well
const injectedContent = inject('content') as string
const contentToBoost = injectedContent ?? props.content
const boost = async () => {
    $q.loading.show({
      // delay: 400 // ms
    })
    // Get the txid by removing the utxo from the token contract
    const contentTxid = props?.content.substring(0, props?.content.indexOf('_'));
    const promise = new Promise(async (resolve, reject) => {
    try {
      // @ts-expect-error
      const stag = wrapRelayx(relayone)
      if (props.onSending)
        props.onSending()

      console.log('stag.boost.buy', {
        content: contentTxid,
        difficulty: difficulty.value,
        value: totalPriceInSatoshis.value,
        tag: tag.value,
      })

      await stag.boost.buy({
        content: contentTxid,
        difficulty: difficulty.value,
        value: totalPriceInSatoshis.value,
        tag: props.tag,
      })
      if (props.onSuccess)
        props.onSuccess({ txid: contentTxid }, )
      // @ts-expect-error
      relayone
        .send({
          currency: 'BSV',
          amount: devFee.value * 1e-8,
          to: '15etMzuXHaEFuoaKCt5gw16LYGrLX7iKKj', // ielvis Twetch address for testing
        })
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          console.error('relayone.send.reward.error', error)
          reject(error)
        })
    }
    catch (error) {
      console.error('relayx', error)
      $q.loading.hide()
      if (props.onError) {
        $q.loading.hide()
        props.onError(error)
        reject(error)
      }
    }
  })
  if (props.onClick)
    props.onClick(promise)
}
</script>


<style scoped>
.pulse {
  cursor: pointer;
  border-radius: 100%;
  box-shadow: 0 0 0 0 rgba(107, 156, 250, 1);
}

.pulse:hover {
  transform: scale(1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(107, 156, 250, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(107, 156, 250, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(107, 156, 250, 0);
  }
}

.boostpow-dialog {
  padding: 10px;
  min-height: 250px;
}

.boostpow-header {
  display: flex;
  align-items: center;
}

.boostpow-title {
  margin-left: 10px;
  font-size: 1.5rem;
}

.boostpow-slider {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.boostpow-slider .q-slider__label.turtle:before {
  content: '🐢';
}

.boostpow-slider .q-slider__label.rabbit:before {
  content: '🐇';
}

.boostpow-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.boostpow-devfee {
  font-size: 0.75rem;
}
</style>
