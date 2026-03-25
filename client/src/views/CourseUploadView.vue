<template>
  <div class="upload-view">
    <h2>Yeni Kurs Yükle</h2>
    <form class="flex flex-col gap-4 mt-8">
      <label>
        Kurs Başlığı
        <input type="text" placeholder="Örnek: Sıfırdan Vue.js" />
      </label>
      <label>
        Kategori
        <select>
          <option>Yazılım</option>
          <option>Tasarım</option>
          <option>Arduino</option>
        </select>
      </label>
      <label>
        Video Dosyası Yükle
        <input type="file" accept="video/mp4,video/x-m4v,video/*" />
      </label>
      <button type="submit" class="btn">Kursu Yayınla</button>
    </form>
  </div>
</template>

<style scoped>
.upload-view { max-width: 600px; margin: 0 auto; padding: 2rem 0; }
h2 { color: var(--accent); margin-bottom: 2rem; }
label { display: flex; flex-direction: column; gap: 0.5rem; color: var(--text-secondary); }
input, select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-card);
  color: var(--text-primary);
}
.btn { margin-top: 1rem; }
</style>
