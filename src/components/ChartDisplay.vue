<script setup lang="ts">
  import { ref } from 'vue'
  import type uPlot from 'uplot'
  import UplotVue from 'uplot-vue'
  import 'uplot/dist/uPlot.min.css'
  
  import { charts } from './charts'
  
  const boomKey = ref(0);
  const mapKey = ref(0);

  function update() {
    //charts["boom"].chart.redraw();
    // set range
    //if (boomKey.value % 10  == 0) { console.log("updating..."); }
    boomKey.value +=1;
    mapKey.value +=1;
  }
  defineExpose({
    update 
  })
</script>

<template>
  <UplotVue
      :data="charts['map'].data"
      :options="charts['map'].options"
      @create="(chart: uPlot) => { charts['map'].chart = chart; }"
      :key="mapKey"
  />
  <UplotVue
    :data="charts['boom'].data"
    :options="charts['boom'].options"
    @create="(chart: uPlot) => { charts['boom'].chart = chart; }"
    :key="boomKey"
  />
  <UplotVue
    :data="charts['rudder'].data"
    :options="charts['rudder'].options"
    @create="(chart: uPlot) => { charts['rudder'].chart = chart; }"
  />
</template>