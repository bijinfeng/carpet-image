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
import { reactive } from 'vue'

const layoutStore = useLayoutStore()

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
</script>

<template>
  <div class="w-60">
    <div class="py-2.5 border-b">
      <div class="px-2.5 h-8 flex items-center">
        <Label class="font-bold text-xs px-[6px]">尺寸</Label>
      </div>
      <div class="gap-row ">
        <InputPanel v-model:model-value="layoutStore.contextState.width">
          <template #prefix>
            <WIcon />
          </template>
        </InputPanel>
        <InputPanel v-model:model-value="layoutStore.contextState.height">
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
          <InputPanel v-model:model-value="layoutStore.contextState.radius.leftBottom" :min="0">
            <template #prefix>
              <LeftTopRadiusIcon />
            </template>
          </InputPanel>
        </template>
        <template v-else>
          <InputPanel v-model:model-value="layoutStore.contextState.radius.leftTop" text-align="right" :min="0">
            <template #suffix>
              <Tooltip content="左上角半径">
                <LeftTopRadiusIcon />
              </Tooltip>
            </template>
          </InputPanel>
          <InputPanel v-model:model-value="layoutStore.contextState.radius.rightTop" :min="0">
            <template #prefix>
              <Tooltip content="右上角半径">
                <RightTopRadiusIcon />
              </Tooltip>
            </template>
          </InputPanel>
          <InputPanel v-model:model-value="layoutStore.contextState.radius.leftBottom" text-align="right" :min="0">
            <template #suffix>
              <Tooltip content="左下角半径">
                <LeftBottomRadiusIcon />
              </Tooltip>
            </template>
          </InputPanel>
          <InputPanel v-model:model-value="layoutStore.contextState.radius.rightBottom" :min="0">
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
        <Input v-model:model-value="layoutStore.contextState.remark" type="text" />
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
