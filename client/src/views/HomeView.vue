<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../stores/theme'

import logoMinimalDark from '../assets/logos/libre-akademi-minimal.png'
import logoMinimalLight from '../assets/logos/libre-akademi-minimal-light.png'

const themeStore = useThemeStore()
const heroLogo = computed(() => themeStore.isDark ? logoMinimalDark : logoMinimalLight)

const stats = ref([
  { label: 'Özgür Kurs', value: '1,200+', icon: 'bi-book' },
  { label: 'Öğrenci', value: '50k+', icon: 'bi-people' },
  { label: 'Eğitmen', value: '300+', icon: 'bi-person-workspace' }
])

const infoCards = [
  {
    title: 'Usulüyle öğrenin',
    desc: 'Libre akademi geniş bir kategoride topluluğun paylaştığı kursları tamamlamanıza olanak sağlar.',
    icon: 'bi-journal-richtext'
  },
  {
    title: 'Tamamen açık kaynak',
    desc: 'Libre akademi AGPL 3.0 lisanslı ile dağıtılır ve isteyen herkes koda katkı sağlayabilir.',
    icon: 'bi-file-earmark-code'
  },
  {
    title: 'Pratik ve hızlı',
    desc: 'Sadece öğrenmeye odaklanın, gerisini biz hızlı ve temiz arayüzümüzle hallederiz.',
    icon: 'bi-lightning-charge'
  },
  {
    title: 'Size değer veriyoruz.',
    desc: 'Sitemizde herhangi bir reklam veya 3. parti, kötü amaçlı çerez barındırmıyoruz.',
    icon: 'bi-shield-check'
  },
  {
    title: 'Topluluk odaklı',
    desc: 'Libre akademide ister eğitimci olun ister öğrenci, topluluğun bir parçası olmak değerlidir.',
    icon: 'bi-people'
  },
  {
    title: 'Kurslar için bağış toplayın.',
    desc: 'Eklediğiniz kurslar için dilerseniz bir bağış butonu koyabilir ve öğrencilerinizden bağış alabilirsiniz.',
    icon: 'bi-cash-coin'
  }
]
</script>

<template>
  <div class="home-view">
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge"><i class="bi bi-mortarboard-fill"></i> Özgür &amp; Açık Kaynak</div>
        <h1>Bilgiyi <span class="highlight">Özgürce</span> Paylaşın ve Öğrenin</h1>
        <p>Libre Akademi, AGPL Lisansı ile dağıtılan açık kaynak ve topluluk odaklı bir çevrimiçi öğrenme platformudur.</p>
        <div class="hero-actions gap-4 flex">
          <RouterLink to="/courses" class="btn btn-lg">
            <i class="bi bi-search"></i> Kursları Keşfet
          </RouterLink>
          <RouterLink to="/login" class="btn btn-lg btn-outline">
            <i class="bi bi-mortarboard"></i> Eğitmen Ol
          </RouterLink>
        </div>
      </div>
      <div class="hero-visual">
        <img :src="heroLogo" alt="Libre Akademi" class="hero-logo" />
      </div>
    </section>

    <section class="stats flex justify-between">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <i :class="`bi ${stat.icon} stat-icon`"></i>
        <h3>{{ stat.value }}</h3>
        <span>{{ stat.label }}</span>
      </div>
    </section>

    <section class="info-cards">
      <div 
        v-for="(card, index) in infoCards" 
        :key="index" 
        class="info-card" 
        :class="{ 'reverse': index % 2 !== 0 }"
      >
        <div class="info-content">
          <h2>{{ card.title }}</h2>
          <p>{{ card.desc }}</p>
        </div>
        <div class="info-icon">
          <i :class="`bi ${card.icon}`"></i>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-card">
        <h2>Katılmaya hazır mısınız?</h2>
        <RouterLink to="/register" class="btn-register">
          <i class="bi bi-person-plus-fill"></i> Kayıt Ol
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 0.5rem 0 5rem 0;
}
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3rem 4rem;
  background-color: var(--bg-secondary);
  border-radius: 20px;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
  gap: 3rem;
  position: relative;
  max-width: 1100px;
  margin: 1rem auto 1.5rem auto;
}
.hero::before {
  content: '';
  position: absolute;
  top: 20px;
  right: 20px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, var(--accent) 0%, transparent 65%);
  opacity: 0.12;
  pointer-events: none;
  border-radius: 50%;
  z-index: 0;
}
.hero > * {
  position: relative;
  z-index: 1;
}
.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--accent);
  color: #fff;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  width: fit-content;
}
[data-theme="dark"] .hero-badge {
  color: var(--bg-primary);
}
.hero h1 {
  font-size: 3.8rem;
  font-weight: 900;
  line-height: 1.1;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}
.highlight {
  color: var(--accent);
}
.hero p {
  font-size: 1.15rem;
  color: var(--text-secondary);
  max-width: 520px;
  line-height: 1.7;
}
.hero-actions {
  margin-top: 0.5rem;
}
.hero-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hero-logo {
  width: 240px;
  height: 240px;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.15));
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--accent);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.05rem;
  transition: all 0.2s ease;
}
.btn:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
  background: var(--accent);
  color: #fff;
}
[data-theme="dark"] .btn-outline {
  color: var(--accent);
}
[data-theme="dark"] .btn-outline:hover {
  color: var(--bg-primary);
}
.stats {
  padding: 0 1rem;
  gap: 2rem;
  margin: 0 auto 5rem auto;
  max-width: 1100px;
  width: 100%;
}
.stat-card {
  flex: 1;
  background-color: var(--bg-card);
  padding: 1.75rem 1.5rem;
  text-align: center;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px -4px rgba(0,0,0,0.12);
}
.stat-icon {
  font-size: 2rem;
  color: var(--accent);
  display: block;
  margin-bottom: 0.75rem;
}
.stat-card h3 {
  font-size: 2.5rem;
  color: var(--accent);
  margin-bottom: 0.4rem;
  font-weight: 800;
}
.stat-card span {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Info Cards */
.info-cards {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}
.info-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-card);
  padding: 3rem 10vw;
  border-radius: 0;
  border: none;
  border-top: 1px solid var(--border-color);
  width: 100%;
  gap: 4rem;
}
.info-card:nth-child(even) {
  background-color: var(--bg-secondary);
}
.info-card.reverse {
  flex-direction: row-reverse;
}
.info-content {
  flex: 1;
}
.info-content h2 {
  font-size: 2.8rem;
  color: var(--accent);
  margin-bottom: 0.8rem;
  font-weight: 800;
}
.info-content p {
  font-size: 1.5rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
.info-icon {
  font-size: 5rem;
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  opacity: 0.9;
}

/* CTA Section */
.cta-section {
  display: flex;
  justify-content: center;
  padding: 5rem 1rem;
}
.cta-card {
  background-color: var(--bg-card);
  padding: 3.5rem 5rem;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  text-align: center;
  box-shadow: 0 10px 30px -5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}
.cta-card h2 {
  font-size: 2.5rem;
  color: var(--accent);
  font-weight: 800;
}
.btn-register {
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 2px solid var(--accent);
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 1.15rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-register:hover {
  background-color: var(--accent);
  color: var(--bg-primary);
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    padding: 2rem 1.5rem;
    text-align: center;
  }
  .hero-badge { margin: 0 auto; }
  .hero h1 { font-size: 2.5rem; }
  .hero p { max-width: 100%; }
  .hero-actions { justify-content: center; }
  .hero-logo { width: 160px; height: 160px; }
  .stats { flex-direction: column; }
  .info-card, .info-card.reverse {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
    gap: 1.5rem;
  }
}
</style>
