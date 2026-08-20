<template>
  <footer class="foot">
    <a href="https://github.com/vmeirelle/kanji-app" target="_blank" rel="noopener">
      Open source · @vmeirelle/kanji-app
    </a>
    <span>© 2026</span>
  </footer>
</template>

<style scoped>
.foot {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.75rem 0.5rem 0;
  font-size: 0.72rem;
  color: var(--color-text);
  opacity: 0.75;
}
.foot a {
  color: var(--color-text);
  text-decoration: none;
}
.foot a:hover {
  color: var(--color-heading);
  text-decoration: underline;
}
</style>
