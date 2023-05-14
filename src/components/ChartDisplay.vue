<script setup lang="ts">
  import { getCurrentInstance, ref } from 'vue'
  import type uPlot from 'uplot'
  import UplotVue from 'uplot-vue'
  import 'uplot/dist/uPlot.min.css'
  
  import { charts } from './charts'
  
  const boomKey = ref(0);

  function update() {
    charts["boom"].chart.redraw();
    boomKey.value +=1;
  }
  defineExpose({
    update 
  })
</script>

<template>
  <UplotVue
      :data="charts['map'].data"
      :options="charts['map'].options"
      @create="(chart: uPlot) => { charts['map'].chart = chart }"
      ref="test"
  />
  <UplotVue
    :data="charts['boom'].data"
    :options="charts['boom'].options"
    @create="(chart: uPlot) => { charts['boom'].chart = chart; }"
    ref="test2"
    :key="boomKey"
  />
  <UplotVue
    :data="charts['rudder'].data"
    :options="charts['rudder'].options"
    @create="(chart: uPlot) => { charts['rudder'].chart = chart; }"
    :key="boomKey"
  />
</template>