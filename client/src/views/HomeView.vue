<script setup>
import { ref } from 'vue'

const stats = ref([
  { label: 'Özgür Kurs', value: '1,200+' },
  { label: 'Öğrenci', value: '50k+' },
  { label: 'Eğitmen', value: '300+' }
])
</script>

<template>
  <div class="home-view">
    <section class="hero flex flex-col items-center">
      <h1>Bilgiyi <span class="highlight">Özgürce</span> Paylaşın ve Öğrenin</h1>
      <p>Açık kaynak destekli, topluluk odaklı çevrimiçi eğitim platformu.</p>
      <div class="hero-actions mt-8 gap-4 flex">
        <RouterLink to="/courses" class="btn btn-lg">Kursları Keşfet</RouterLink>
        <RouterLink to="/upload" class="btn btn-lg btn-outline">Eğitmen Ol</RouterLink>
      </div>
    </section>

    <section class="stats flex justify-between">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <h3>{{ stat.value }}</h3>
        <span>{{ stat.label }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding: 2rem 0;
}
.hero {
  text-align: center;
  padding: 4rem 1rem;
  background-color: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}
.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  max-width: 800px;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}
.highlight {
  color: var(--accent);
}
.hero p {
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 600px;
}
.btn {
  background-color: var(--accent);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 1.1rem;
}
.btn:hover {
  background-color: var(--accent-hover);
}
[data-theme="dark"] .btn {
  color: var(--bg-primary);
}
.btn-outline {
  background: transparent;
  color: var(--accent);
  border: 2px solid var(--accent);
}
.btn-outline:hover {
  background: var(--bg-secondary);
}
[data-theme="dark"] .btn-outline {
  color: var(--accent);
}
.stats {
  padding: 2rem;
  gap: 2rem;
}
.stat-card {
  flex: 1;
  background-color: var(--bg-card);
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.stat-card h3 {
  font-size: 2.5rem;
  color: var(--accent);
  margin-bottom: 0.5rem;
}
.stat-card span {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-secondary);
}
</style>
