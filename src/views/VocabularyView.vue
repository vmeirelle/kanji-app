<script setup lang="ts">
import PageHeader from '../components/base/PageHeader.vue'
import BaseImage from '../components/base/BaseImage.vue'

const emit = defineEmits<{ practice: [] }>()
</script>

<template>
  <section class="vocab">
    <PageHeader jp="文章" title="Reading" image="/reading.png" />

    <div class="scroll">
      <div class="hero">
        <BaseImage class="art" src="/eureka.png" :height="7" alt="" />
        <span class="badge">Under development</span>

        <h2 class="lead">Build your vocabulary</h2>
        <p class="body">
          Answer the same word correctly <b>10 times</b> and it graduates into your vocabulary.
        </p>
        <p class="body">
          Once you've collected some words, we'll start releasing <b>phrases</b> built from the
          vocabulary you already know.
        </p>
        <p class="body muted">Come back later when you have vocabulary here — keep practicing!</p>

        <button class="btn" @click="emit('practice')">Keep practicing</button>
      </div>

      <div class="roadmap">
        <span class="tag">What's coming</span>
        <ul>
          <li><span class="arrow">→</span> Practice your vocabulary to keep it fresh</li>
          <li><span class="arrow">→</span> Read full sentences until you reach the full text</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.vocab {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
}
.art {
  margin-bottom: 0.25rem;
}
.badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--lv-N3);
  background: color-mix(in srgb, var(--lv-N3) 16%, var(--color-background));
  border: 1px solid color-mix(in srgb, var(--lv-N3) 40%, transparent);
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
}
.lead {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-top: 0.25rem;
}
.body {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--color-text);
  max-width: 24rem;
}
.body b {
  color: var(--color-heading);
  font-weight: 700;
}
.body.muted {
  opacity: 0.8;
  font-size: 0.88rem;
}
.btn {
  margin-top: 0.75rem;
  padding: 0.8rem 1.5rem;
  border: 2px solid var(--brand);
  border-radius: 0.9rem;
  background: var(--brand);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.roadmap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.1rem 1.2rem;
  border: 2px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-background-soft);
}
.tag {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text);
}
.roadmap ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.roadmap li {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  font-size: 0.95rem;
  color: var(--color-heading);
}
.arrow {
  color: var(--lv-N3);
  font-weight: 700;
}
</style>
