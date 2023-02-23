<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { computed, inject } from 'vue'
import { wrapRelayx } from 'stag-relayx'
const props = defineProps({
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
const colorClasses = computed(() => {
  const baseClasses = 'bg-blue-600 text-blue-100 border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:text-white'
  const outlineClasses = 'border-blue bg-white text-blue hover:bg-blue-200 hover:border-blue hover:text-white'
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
const boost = () => {
  const promise = new Promise(async (resolve, reject) => {
    try {
      // @ts-expect-error
      const stag = wrapRelayx(relayone)
      if (props.onSending)
        props.onSending()
      console.log('props are: ', props)
      const { txid, txhex, job } = await stag.boost.buy({
        content: contentToBoost,
        difficulty: 0.025,
        value: 124_000,
        tag: props.tag,
      })
      if (props.onSuccess)
        props.onSuccess({ txid, txhex, job })
      // @ts-expect-error
      relayone
        .send({
          currency: 'USD',
          amount: 0.001,
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
      if (props.onError) {
        props.onError(error)
        reject(error)
      }
    }
  })
  if (props.onClick)
    props.onClick(promise)
}
</script>

<template>
  <component :is="buttonType"
    class="pulse font-medium flex items-center cursor-pointer border shadow hover:shadow-lg focus:outline-none focus:shadow-outline"
    :href="href" :type="type" :class="btnClasses" @click="boost(content)">
    <slot />
  </component>
</template>

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
</style>
