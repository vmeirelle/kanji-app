<script setup lang="ts">
import PageHeader from '../components/base/PageHeader.vue'

const news = [
  { tag: 'New', title: 'Basics mode is here', body: 'Drill hiragana & katakana row by row.', when: 'Today' },
  { tag: 'Soon', title: 'Vocabulary & phrases', body: 'Words you master turn into sentences.', when: 'Coming' },
  { tag: 'Update', title: 'Ranked scoring', body: 'Beat the 10s clock — seconds become points.', when: 'Recent' },
]
</script>

<template>
  <section class="home">
    <PageHeader jp="ホーム" title="Home" image="/eureka.png" />

    <div class="scroll">
      <div class="block">
        <span class="tag">News</span>
        <div class="news">
          <article v-for="n in news" :key="n.title" class="news-card">
            <span class="pill">{{ n.tag }}</span>
            <div class="news-body">
              <h3 class="news-title">{{ n.title }}</h3>
              <p class="news-text">{{ n.body }}</p>
            </div>
            <span class="when">{{ n.when }}</span>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}
.block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.tag {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
}
.news {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.news-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  border: 2px solid var(--color-border);
  border-radius: 0.9rem;
  background: var(--color-background-soft);
}
.pill {
  flex: none;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fff;
  background: var(--lv-N3);
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
}
.news-body {
  flex: 1;
  min-width: 0;
}
.news-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-heading);
}
.news-text {
  font-size: 0.82rem;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.when {
  flex: none;
  font-size: 0.72rem;
  color: var(--color-text);
  opacity: 0.7;
}
</style>
