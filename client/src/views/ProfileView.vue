<template>
  <div class="profile-view">
    <div class="profile-header flex items-center gap-4 mb-8">
      <div class="avatar">👨‍💻</div>
      <div>
        <h2>Ahmet Yılmaz</h2>
        <p class="bio">Öğrenmeye her zaman aç, tam yığın geliştirici.</p>
      </div>
    </div>

    <div class="profile-content grid gap-4">
      <div class="section-card">
        <h3>Tamamlanan Kurslar</h3>
        <ul>
          <li>🎉 Sıfırdan İleri Seviye Vue.js 3</li>
        </ul>
      </div>
      
      <div class="section-card">
        <h3>Devam Eden Kurslar</h3>
        <ul>
          <li>⏳ Node.js ile Modern Backend</li>
        </ul>
      </div>

      <div class="section-card">
        <h3>Yayınlanan Kurslarım</h3>
        <ul>
          <li>📚 Gruvbox Tasarım İlkeleri</li>
        </ul>
        <RouterLink to="/upload" class="btn btn-sm mt-4 inline-block">Yeni Kurs Yükle</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view { max-width: 800px; margin: 0 auto; padding: 2rem 0; }
.avatar { font-size: 4rem; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; background: var(--bg-card); border-radius: 50%; border: 2px solid var(--accent); }
.profile-header h2 { color: var(--text-primary); margin-bottom: 0.25rem; }
.bio { color: var(--text-secondary); }
.profile-content { grid-template-columns: 1fr; }
.section-card {
  background: var(--bg-card); padding: 2rem;
  border-radius: 8px; border: 1px solid var(--border-color);
}
.section-card h3 { color: var(--accent); margin-bottom: 1rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem; }
ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
li { color: var(--text-primary); padding: 0.5rem; border-radius: 4px; background: var(--bg-secondary); }
.btn-sm { font-size: 0.9rem; }
</style>
