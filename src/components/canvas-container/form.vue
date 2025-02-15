<script setup lang="ts">
import HIcon from '@/assets/h.svg?component'
import LeftBottomRadiusIcon from '@/assets/left-bottom-radius.svg?component'

import LeftTopRadiusIcon from '@/assets/left-top-radius.svg?component'
import RightBottomRadiusIcon from '@/assets/right-bottom-radius.svg?component'
import RightTopRadiusIcon from '@/assets/right-top-radius.svg?component'
import WIcon from '@/assets/w.svg?component'
import InputPanel from '@/components/input-panel/index.vue'
import Tooltip from '@/components/tooltip.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLayoutStore } from '@/stores/layout'
import { LockIcon, LockOpenIcon, MaximizeIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { reactive } from 'vue'

const layoutStore = useLayoutStore()
const { contextState } = storeToRefs(layoutStore)

const state = reactive({
  sizeLock: false, // 锁定宽高比
  radiusLock: true, // 独立圆角
})

function checkSizeLock() {
  state.sizeLock = !state.sizeLock
}

function checkRadiusLock() {
  state.radiusLock = !state.radiusLock
}

function changeAllRadius(val: number) {
  contextState.value.radius = {
    leftTop: val,
    rightTop: val,
    rightBottom: val,
    leftBottom: val,
  }
}

function changeWidth(val: number) {
  if (state.sizeLock) {
    contextState.value.height = contextState.value.height / contextState.value.width * val
  }

  contextState.value.width = val
}

function changeHeight(val: number) {
  if (state.sizeLock) {
    contextState.value.width = contextState.value.width / contextState.value.height * val
  }

  contextState.value.height = val
}
</script>

<template>
  <div class="w-60">
    <div class="py-2.5 border-b">
      <div class="px-2.5 h-8 flex items-center">
        <Label class="font-bold text-xs px-[6px]">尺寸</Label>
      </div>
      <div class="gap-row ">
        <InputPanel :model-value="contextState.width" @update:model-value="changeWidth">
          <template #prefix>
            <WIcon />
          </template>
        </InputPanel>
        <InputPanel :model-value="contextState.height" @update:model-value="changeHeight">
          <template #prefix>
            <HIcon />
          </template>
        </InputPanel>
        <Tooltip :content="state.sizeLock ? '解锁宽高比' : '锁定宽高比'">
          <Button
            variant="ghost"
            size="icon"
            class="w-7 h-7"
            @click="checkSizeLock"
          >
            <LockIcon v-if="state.sizeLock" class="size-4" />
            <LockOpenIcon v-else class="size-4" />
          </Button>
        </Tooltip>
      </div>
      <div class="gap-row">
        <template v-if="state.radiusLock">
          <InputPanel
            :model-value="contextState.radius.leftTop"
            :min="0"
            @update:model-value="changeAllRadius"
          >
            <template #prefix>
              <LeftTopRadiusIcon />
            </template>
          </InputPanel>
        </template>
        <template v-else>
          <InputPanel v-model:model-value="contextState.radius.leftTop" text-align="right" :min="0">
            <template #suffix>
              <Tooltip content="左上角半径">
                <LeftTopRadiusIcon />
              </Tooltip>
            </template>
          </InputPanel>
          <InputPanel v-model:model-value="contextState.radius.rightTop" :min="0">
            <template #prefix>
              <Tooltip content="右上角半径">
                <RightTopRadiusIcon />
              </Tooltip>
            </template>
          </InputPanel>
          <InputPanel v-model:model-value="contextState.radius.leftBottom" text-align="right" :min="0">
            <template #suffix>
              <Tooltip content="左下角半径">
                <LeftBottomRadiusIcon />
              </Tooltip>
            </template>
          </InputPanel>
          <InputPanel v-model:model-value="contextState.radius.rightBottom" :min="0">
            <template #prefix>
              <Tooltip content="右下角半径">
                <RightBottomRadiusIcon />
              </Tooltip>
            </template>
          </InputPanel>
        </template>
        <Tooltip :content="state.radiusLock ? '独立圆角' : '圆角'">
          <Button
            variant="ghost"
            size="icon"
            class="w-7 h-7"
            @click="checkRadiusLock"
          >
            <MaximizeIcon class="size-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
    <div class="py-2.5">
      <div class="px-2.5 h-8 flex items-center">
        <Label class="font-bold text-xs px-[6px]">备注</Label>
      </div>

      <div class="px-2.5">
        <Input v-model:model-value="contextState.remark" type="text" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.gap-row {
  grid-column-gap: 4px;
  align-items: center;
  display: grid;
  grid-auto-flow: row dense;
  grid-template-columns: repeat(14, 12px);
  grid-template-rows: 32px;
  padding: 0 10px;
}
</style>
