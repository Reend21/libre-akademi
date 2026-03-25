<template>
  <div class="courses-view">
    <h1>Tüm Kurslar</h1>
    <div class="filters mb-4">
      <input type="text" placeholder="Kurs ara..." class="search-input" />
      <select class="category-select">
        <option value="">Tüm Kategoriler</option>
        <option value="yazilim">Yazılım</option>
        <option value="tasarim">Tasarım</option>
        <option value="arduino">Arduino</option>
      </select>
    </div>
    <div class="grid">
      <div v-for="i in 6" :key="i" class="course-card">
        <div class="card-image"></div>
        <div class="card-content">
          <h3>Örnek Kurs Başlığı {{ i }}</h3>
          <p class="instructor">Eğitmen {{ i }}</p>
          <div class="rating">⭐⭐⭐⭐⭐ (4.8)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.courses-view { padding: 2rem 0; }
.filters { display: flex; gap: 1rem; margin-bottom: 2rem; }
.search-input, .category-select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-card);
  color: var(--text-primary);
  flex: 1;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}
.course-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
}
.course-card:hover { transform: translateY(-4px); }
.card-image { height: 160px; background: var(--bg-secondary); }
.card-content { padding: 1.5rem; }
.card-content h3 { margin-bottom: 0.5rem; color: var(--text-primary); }
.instructor { color: var(--text-secondary); margin-bottom: 1rem; }
.rating { color: var(--accent); font-weight: bold; }
</style>
