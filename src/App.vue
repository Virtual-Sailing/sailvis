<script setup lang="ts">
  import { ref, } from 'vue'

  import ChartDisplay from './components/ChartDisplay.vue'
  import { loadCSV } from './components/charts'
  import * as strings from './assets/strings'

  const loading = ref(false)
  const activeTab = ref("charts")
  const help = "To get started, click the sailboat icon in the top right"
  const errormsg = "Error: Recording file is corrupt or made with version that is too old."
  const filename = ref("")
  const toolbartitle = ref(strings.appname)
  const fileopen = ref<HTMLInputElement>();
  const cd = ref<InstanceType<typeof ChartDisplay> | null>(null);
  const showerror = ref(false);

  function loadfile(event : Event) {
    let file = (event.target as HTMLInputElement).files![0]; // assume file must always come? because if cancel is clicked change event isn't registered.
    filename.value = file.name;
    loading.value = true;
    loadCSV(file, loadedfile, ()=>cd.value?.update());
  }

  function loadedfile(success: boolean) {
    loading.value = false;
    activeTab.value = "charts"
    if (success) {
      const newtitle = `${strings.appnameshort} - ${filename.value}`
      document.title = newtitle
      toolbartitle.value = newtitle
      cd.value?.update();
    } else {
      showerror.value = true;
      const newtitle = `${strings.appname}`
      document.title = newtitle
      toolbartitle.value = newtitle
    }
  }

  function clickLoad() {
    fileopen.value?.click();
  }

</script>

<template>
  <v-toolbar color="primary">
      <v-toolbar-title>{{ toolbartitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon title="test">
        <v-icon>fa-solid fa-bomb</v-icon>
      </v-btn>
      <v-btn icon title="open sail" :loading="loading" @click="clickLoad">
        <v-icon icon="fas fa-sailboat"/>
      </v-btn>
      <input class="d-none" type="file" ref="fileopen" accept=".sbp" @change="loadfile"/>
      <template v-slot:extension>
        <v-tabs v-model="activeTab" centered grow>
          <v-tab value="charts">Charts</v-tab>
          <v-tab value="others">Others</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

  <v-window v-model="activeTab">
    <v-dialog v-model="showerror" width="auto" >
      <v-card>
        <v-card-text>{{ errormsg }}</v-card-text>
        <v-card-actions><v-btn color="primary" block @click="showerror = false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-window-item value="charts">
      <span v-show="filename === ''">{{ help }}</span>
      <ChartDisplay ref="cd"/>
    </v-window-item>
    <v-window-item value="others">
      <span>test</span>
    </v-window-item>
  </v-window>
</template>