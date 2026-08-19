<script setup lang="ts">
import { useBasics } from '../composables/useQuiz'
import QuizFlow from './QuizFlow.vue'

const q = useBasics()
</script>

<template>
  <QuizFlow :quiz="q" />
</template>
