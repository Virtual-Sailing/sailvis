<style>
  .u-select {
    background: rgba(46, 254, 185, 0.367);
  }
</style>
<script setup lang="ts">
  import { ref, } from 'vue'
  import { useTheme } from 'vuetify'
  import ChartDisplay from './components/ChartDisplay.vue'
  import { loadCSV } from './components/charts'
  import * as strings from './assets/strings'
  
  let apploaded = false;
  const loading = ref(false)
  const activeTab = ref("charts")
  const help = "To get started, click the sailboat icon in the top right"
  const errormsg = "Error: Recording file is corrupt or made with version that is too old."
  const filename = ref("")
  const toolbartitle = ref(strings.appname)
  const fileopen = ref<HTMLInputElement>();
  const filesave = ref<string>();
  const cd = ref<InstanceType<typeof ChartDisplay> | null>(null);
  const showerror = ref(false);
  const theme = useTheme();
  const themeWatcher = window.matchMedia("(prefers-color-scheme: dark)");
  themeWatcher.addEventListener("change", e => {
    if (e.matches) { setTheme(true); } else { setTheme(false); }
  });

  function loadfileEvent(event : Event) {
    let openedfile = (event.target as HTMLInputElement).files![0]; // assume file must always come? because if cancel is clicked change event isn't registered.
    loadFile(openedfile);
  }
  function loadFile(f: File) {
    filename.value = f.name;
    loading.value = true;
    loadCSV(f, loadedfile, ()=>{ cd.value?.update(); });
    if (filesave) { 
      if (f) { filesave.value = URL.createObjectURL(f); }
      else { filesave.value = ""; }
    }
  }

  function loadedfile(success: boolean) {
    loading.value = false;
    activeTab.value = "charts"
    if (success) {
      const newtitle = `${strings.appnameshort} - ${filename.value}`
      document.title = newtitle
      toolbartitle.value = newtitle
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
  function setTheme(dark:boolean) {
    theme.global.name.value = dark ? 'dark' : 'light'
    cd.value?.setTheme(dark);
  }
  
  function toggleTheme() {
    setTheme(!theme.global.current.value.dark);
  }
  async function appLoad() {
    if (!apploaded) {
      if (themeWatcher.matches) { setTheme(true); } else { setTheme(false); }
      if (!apploaded && window.api != null) {
        var fload = await window.api.getFileData();
        var fname = await window.api.getFileName();
        console.log(`Filename: ${fname}`);
        if (fname != "")
        {
          var f = new File([fload.buffer as ArrayBuffer], fname);
          loadFile(f);
        }
      }
      apploaded = true;
    }
  }
</script>

<template>
  <v-app>
    <v-toolbar color="primary">
        <v-toolbar-title>{{ toolbartitle }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn @click="toggleTheme" title="Toggle theme">
          <v-icon icon="fa-regular fa-lightbulb"/>
        </v-btn>
        <v-btn icon title="save sail" :href="filesave" :download="filename">
          <v-icon icon="fa-regular fa-floppy-disk"/>
        </v-btn>
        <v-btn icon title="open sail" :loading="loading" @click="clickLoad">
          <v-icon icon="fas fa-sailboat"/>
        </v-btn>
        <input class="d-none" type="file" ref="fileopen" accept=".sbp" @change="loadfileEvent"/>
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
        <ChartDisplay ref="cd" @vue:mounted="()=>{ appLoad(); }"/>
      </v-window-item>
      <v-window-item value="others">
        <span>test</span>
      </v-window-item>
    </v-window>
  </v-app>
</template>