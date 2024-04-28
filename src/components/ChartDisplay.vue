<script setup lang="ts">
  import { ref } from 'vue'
  import type uPlot from 'uplot'
  import UplotVue from 'uplot-vue'
  import 'uplot/dist/uPlot.min.css'
  
  import { charts, switchTheme, setTheme } from './charts'
  
  const chartKey = ref(0);

  function update() {
    // not sure why but this works (??)
    chartKey.value +=1;
  }
  defineExpose({
    update,
    switchTheme,
    setTheme
  })
</script>

<style>
.grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,600px)
}
</style>

<template>
  <v-container class="pa-0 ma-0" fluid >
    <section class="grid">
      <div class="item" style="grid-row: 1 / span 2">
        <UplotVue style="width: 600px; height: 630px"
            :data="charts['map'].data"
            :options="charts['map'].options"
            @create="(chart: uPlot) => { charts['map'].chart = chart; }"
            :key="chartKey"
          />
      </div>
      <div class="item">
        <UplotVue style="width: 600px; height: 330px"
          :data="charts['fwd'].data"
          :options="charts['fwd'].options"
          @create="(chart: uPlot) => { charts['fwd'].chart = chart; }"
          :key="chartKey"
        />
      </div>
      <div class="item">
        <UplotVue style="width: 600px; height: 330px"
          :data="charts['boom'].data"
          :options="charts['boom'].options"
          @create="(chart: uPlot) => { charts['boom'].chart = chart; }"
          :key="chartKey"
        />
      </div>
      <div class="item">
        <UplotVue style="width: 600px; height: 330px"
          :data="charts['rudder'].data"
          :options="charts['rudder'].options"
          @create="(chart: uPlot) => { charts['rudder'].chart = chart; }"
          :key="chartKey"
        />
      </div>
      <div class="item">
        <UplotVue style="width: 600px; height: 330px"
          :data="charts['heel'].data"
          :options="charts['heel'].options"
          @create="(chart: uPlot) => { charts['heel'].chart = chart; }"
          :key="chartKey"
        />
      </div>
      <div class="item">
        <UplotVue style="width: 600px; height: 330px"
          :data="charts['wind'].data"
          :options="charts['wind'].options"
          @create="(chart: uPlot) => { charts['wind'].chart = chart; }"
          :key="chartKey"
        />
      </div>
      <div class="item">
        <UplotVue style="width: 600px; height: 330px"
          :data="charts['yaw'].data"
          :options="charts['yaw'].options"
          @create="(chart: uPlot) => { charts['yaw'].chart = chart; }"
          :key="chartKey"
        />
      </div>
      <div class="item">
        <UplotVue style="width: 600px; height: 330px"
          :data="charts['hike'].data"
          :options="charts['hike'].options"
          @create="(chart: uPlot) => { charts['hike'].chart = chart; }"
          :key="chartKey"
        />
      </div>
    </section>
  </v-container>
</template>