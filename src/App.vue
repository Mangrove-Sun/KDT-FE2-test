<template>
  <input
    type="file"
    @change="selectFile" />
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent } from 'vue'

export default defineComponent({
  methods: {
    selectFile(event: Event) {
      // html 요소는 언제든지 null일 수 있으므로 타입단언을 해주어야 한다.
      const files = (event.target as HTMLInputElement).files as FileList
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i]
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.addEventListener('load', async e => {
          // console.log((e.target as FileReader).result)
          const { data } = await axios({
            url: 'http://localhost:5001/kdt-fe2-test/us-central1/api/todo',
            method: 'POST',
            data: {
              title: '파일 추가!',
              imageBase64: (e.target as FileReader).result
            }
          })
          console.log('투두 생성 응답:', data)
        })
      }
    }
  }
})


</script>
