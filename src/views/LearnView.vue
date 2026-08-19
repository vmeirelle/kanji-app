<script setup lang="ts">
import { useQuiz } from '../composables/useQuiz'
import QuizConfig from './QuizConfig.vue'
import QuizPlay from './QuizPlay.vue'
import QuizResult from './QuizResult.vue'

const q = useQuiz()
</script>

<template>
  <QuizConfig v-if="q.phase.value === 'ready'" />
  <QuizPlay v-else-if="q.phase.value === 'question'" />
  <QuizResult v-else />
</template>
