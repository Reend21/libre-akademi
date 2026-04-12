<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'

import logoMinimalDark from '../assets/logos/libre-akademi-minimal.png'
import logoMinimalLight from '../assets/logos/libre-akademi-minimal-light.png'

const themeStore = useThemeStore()

const currentMinimalLogo = computed(() => {
  return themeStore.isDark ? logoMinimalDark : logoMinimalLight
})
</script>

<template>
  <footer class="footer">
    <div class="container footer-grid">
      <div class="footer-section main-info">
        <div class="footer-logo">
          <img :src="currentMinimalLogo" alt="Libre Akademi Minimal Logo" height="50">
        </div>
        <p class="footer-desc">Açık kaynaklı ve özgür eğitim platformu. Yazılımın kopyalarını alan herkesin kaynak koduna erişme ve onu geliştirme hakkı vardır.</p>
        <div class="footer-license">
          <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank">
            <i class="bi bi-file-earmark-code"></i> GNU AGPL v3.0 Lisansı
          </a>
        </div>
        <div class="footer-text">
          &copy; 2026 Libre Akademi.
        </div>
      </div>
      
      <div class="footer-section">
        <h4>Platform</h4>
        <ul class="footer-links">
          <li><a href="#"><i class="bi bi-info-circle"></i> Hakkımızda</a></li>
          <li><a href="#"><i class="bi bi-question-circle"></i> SSS</a></li>
          <li><a href="https://github.com/Reend21/libre-akademi" target="_blank"><i class="bi bi-github"></i> GitHub</a></li>
          <li><a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank"><i class="bi bi-file-earmark-code"></i> AGPL Lisans Koşulları</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Kurumsal</h4>
        <ul class="footer-links">
          <li><RouterLink to="/login"><i class="bi bi-person"></i> Profilim</RouterLink></li>
          <li><a href="#"><i class="bi bi-file-earmark-text"></i> Kurs Yükleme Koşulları</a></li>
          <li><a href="#"><i class="bi bi-shield-check"></i> Çerezler</a></li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--bg-secondary); /* Darker than card bg */
  border-top: 2px solid var(--border-color);
  padding: 3rem 0;
  margin-top: auto;
}
[data-theme="dark"] .footer {
  background-color: #282828; /* Even darker for dark mode */
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;
}
.footer-section h4 {
  margin-bottom: 1.2rem;
  color: var(--accent);
  font-size: 1.1rem;
}
.footer-links {
  list-style: none;
  padding: 0;
}
.footer-links li {
  margin-bottom: 0.8rem;
}
.footer-links a, .footer-links .router-link-active, .footer-license a {
  color: var(--text-secondary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}
.footer-links a:hover, .footer-license a:hover {
  color: var(--accent);
}
.footer-desc {
  margin-top: 1rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}
.footer-license {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.footer-text {
  color: var(--text-secondary);
  font-size: 0.85rem;
  opacity: 0.7;
}
@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .footer-links a, .footer-license a {
    justify-content: center;
  }
}
</style>
