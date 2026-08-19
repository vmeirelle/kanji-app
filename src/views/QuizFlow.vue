<script setup lang="ts">
import type { Quiz } from '../composables/useQuiz'
import QuizConfig from './QuizConfig.vue'
import QuizPlay from './QuizPlay.vue'
import QuizResult from './QuizResult.vue'

const props = defineProps<{ quiz: Quiz }>()
const q = props.quiz
</script>

<template>
  <QuizConfig v-if="q.phase.value === 'ready'" :quiz="q" />
  <QuizPlay v-else-if="q.phase.value === 'question'" :quiz="q" />
  <QuizResult v-else :quiz="q" />
</template>
