<template>
  <div class="course-detail-view">
    <div class="video-container mb-4">
      <video controls class="video-player">
        <source src="" type="video/mp4" />
        Tarayıcınız video etiketini desteklemiyor.
      </video>
    </div>
    
    <div class="course-info">
      <h1>Sıfırdan İleri Seviye Vue.js 3</h1>
      <p class="instructor">Eğitmen: <strong>Ahmet Yılmaz</strong></p>
      <div class="rating mb-4">
        <span>⭐⭐⭐⭐⭐ (4.9)</span>
        <button class="btn btn-sm rating-btn">Puan Ver</button>
      </div>
      
      <div class="description mb-8">
        <h3>Kurs Hakkında</h3>
        <p>Vue.js 3 ve Composition API kullanarak modern web uygulamaları geliştirmeyi sıfırdan öğrenin.</p>
      </div>
      
      <div class="lessons mb-8">
        <h3>Ders İçeriği</h3>
        <ul class="lesson-list">
          <li class="lesson-item completed">
            <span>✓ 1. Vue.js'e Giriş</span>
            <span>10:25</span>
          </li>
          <li class="lesson-item active">
            <span>▶ 2. Composition API Temelleri</span>
            <span>15:40</span>
          </li>
          <li class="lesson-item">
            <span>🔒 3. Vue Router Kurulumu</span>
            <span>20:15</span>
          </li>
        </ul>
      </div>

      <div class="reviews">
        <h3>Öğrenci İncelemeleri</h3>
        <div class="review-card">
          <div class="review-header flex justify-between">
            <span class="user">Ayşe D.</span>
            <span class="stars">⭐⭐⭐⭐⭐</span>
          </div>
          <p>Harika bir kurs, çok şey öğrendim!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-detail-view { max-width: 900px; margin: 0 auto; padding: 2rem 0; }
.video-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}
.video-player { width: 100%; aspect-ratio: 16/9; background: #000; }
.course-info h1 { color: var(--text-primary); margin-bottom: 0.5rem; }
.instructor { color: var(--text-secondary); margin-bottom: 1rem; }
.rating { display: flex; align-items: center; gap: 1rem; color: var(--accent); font-weight: bold; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.9rem; }
h3 { color: var(--text-primary); margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
.description p { color: var(--text-secondary); line-height: 1.6; }
.lesson-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.lesson-item {
  display: flex; justify-content: space-between; padding: 1rem;
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 4px; cursor: pointer; transition: background 0.2s;
}
.lesson-item:hover { background: var(--bg-secondary); }
.lesson-item.active { border-left: 4px solid var(--accent); color: var(--accent); font-weight: bold; }
.lesson-item.completed { color: var(--success); }
.reviews { margin-top: 3rem; }
.review-card {
  background: var(--bg-card); padding: 1.5rem;
  border-radius: 8px; border: 1px solid var(--border-color);
  margin-bottom: 1rem;
}
.user { font-weight: bold; color: var(--text-primary); }
.review-card p { margin-top: 0.5rem; color: var(--text-secondary); }
</style>
