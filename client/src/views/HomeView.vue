<script setup>
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { getAuthenticatedHome } from '../api/home'
import { API_BASE } from '../api/client'

import logoMinimalDark from '../assets/logos/libre-akademi-minimal.png'
import logoMinimalLight from '../assets/logos/libre-akademi-minimal-light.png'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const heroLogo = computed(() => themeStore.isDark ? logoMinimalDark : logoMinimalLight)

const loading = ref(false)
const homeData = ref({
  featured: null,
  popular: [],
  categories: []
})

const fetchHomeData = async () => {
  if (!authStore.isLoggedIn) return
  loading.value = true
  try {
    const data = await getAuthenticatedHome(authStore.token)
    homeData.value = data
  } catch (err) {
    console.error('Home data fetch error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHomeData()
})

const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/400x225?text=Libre+Akademi'
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

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
    <!-- Logged Out View -->
    <template v-if="!authStore.isLoggedIn">
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
    </template>

    <!-- Logged In View -->
    <template v-else>
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>
      
      <div v-else class="auth-home-content">
        <!-- Editor's Recommendation (Featured) -->
        <section v-if="homeData.featured" class="featured-recommendation">
          <div class="featured-overlay"></div>
          <img :src="getImageUrl(homeData.featured.coverImage)" alt="Featured Course" class="featured-bg">
          <div class="featured-content">
            <span class="badge-featured">Editörün Önerisi</span>
            <h1>{{ homeData.featured.title }}</h1>
            <p>{{ homeData.featured.description?.slice(0, 160) }}...</p>
            <div class="featured-meta">
              <span><i class="bi bi-play-circle"></i> {{ homeData.featured.lessons?.length || 0 }} Ders</span>
              <span><i class="bi bi-star-fill text-yellow"></i> {{ homeData.featured.averageRating?.toFixed(1) }}</span>
            </div>
            <RouterLink :to="'/courses/' + homeData.featured._id" class="btn-featured-visit">
              Kursu İncele <i class="bi bi-arrow-right"></i>
            </RouterLink>
          </div>
        </section>

        <!-- Popular Courses -->
        <section class="course-section" v-if="homeData.popular.length">
          <h2 class="section-title">Popüler Kurslar</h2>
          <div class="horizontal-scroll">
            <RouterLink 
              v-for="course in homeData.popular" 
              :key="course._id" 
              :to="'/courses/' + course._id"
              class="course-card"
            >
              <div class="course-thumb">
                <img :src="getImageUrl(course.coverImage)" :alt="course.title">
              </div>
              <div class="course-info">
                <h3>{{ course.title }}</h3>
                <div class="course-stats">
                  <span>{{ course.lessonCount || 0 }} Ders</span>
                  <span class="rating">
                    <i class="bi bi-star-fill"></i>
                    {{ (course.averageRating || 0).toFixed(1) }}
                  </span>
                </div>
              </div>
            </RouterLink>
          </div>
        </section>

        <!-- Category Sections -->
        <section class="course-section" v-for="cat in homeData.categories" :key="cat.name">
          <h2 class="section-title">{{ cat.name }}</h2>
          <div class="horizontal-scroll">
            <RouterLink 
              v-for="course in cat.courses" 
              :key="course._id" 
              :to="'/courses/' + course._id"
              class="course-card"
            >
              <div class="course-thumb">
                <img :src="getImageUrl(course.coverImage)" :alt="course.title">
              </div>
              <div class="course-info">
                <h3>{{ course.title }}</h3>
                <div class="course-stats">
                  <span>{{ course.lessonCount || 0 }} Ders</span>
                  <span class="rating">
                    <i class="bi bi-star-fill"></i>
                    {{ (course.averageRating || 0).toFixed(1) }}
                  </span>
                </div>
              </div>
            </RouterLink>
          </div>
        </section>

        <!-- View All Button -->
        <section class="view-all-section">
          <RouterLink to="/courses" class="btn-view-all">
            Bütün Kursları Görüntüle <i class="bi bi-grid-fill"></i>
          </RouterLink>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 0.5rem 0 5rem 0;
}

/* Logged Out Hero Styles */
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

/* Authenticated Home Styles */
.auth-home-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  width: 100%;
}

.featured-recommendation {
  position: relative;
  height: 500px;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 10vw;
}

.featured-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.featured-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--bg-primary) 30%, transparent 100%);
  z-index: 2;
}

.featured-content {
  position: relative;
  z-index: 3;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.badge-featured {
  background: var(--accent);
  color: var(--bg-primary);
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-weight: 800;
  font-size: 0.9rem;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.featured-content h1 {
  font-size: 3.5rem;
  margin: 0;
  line-height: 1.1;
}

.featured-content p {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.featured-meta {
  display: flex;
  gap: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.text-yellow { color: #fabd2f; }

.btn-featured-visit {
  background: var(--accent);
  color: var(--bg-primary);
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 800;
  font-size: 1.1rem;
  width: fit-content;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-featured-visit:hover {
  background: var(--accent-hover);
  transform: translateX(5px);
}

.course-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  padding: 0 2rem;
}

.section-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  padding-left: 2rem;
  border-left: 6px solid var(--accent);
}

.horizontal-scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 1rem 2rem 2rem 2rem;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: var(--accent) transparent;
}

.horizontal-scroll::-webkit-scrollbar {
  height: 6px;
}

.horizontal-scroll::-webkit-scrollbar-thumb {
  background: var(--accent);
  border-radius: 10px;
}

.course-card {
  flex: 0 0 320px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 2px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: var(--accent);
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
}

.course-thumb {
  height: 180px;
  overflow: hidden;
}

.course-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.course-card:hover .course-thumb img {
  transform: scale(1.1);
}

.course-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-info h3 {
  font-size: 1.25rem;
  margin: 0;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3.2rem;
}

.course-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  color: var(--text-secondary);
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--accent);
}

.view-all-section {
  display: flex;
  justify-content: center;
  padding: 2rem 0 5rem 0;
}

.btn-view-all {
  border: 3px solid var(--accent);
  color: var(--accent);
  padding: 1.2rem 3rem;
  border-radius: 50px;
  font-weight: 900;
  font-size: 1.2rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.btn-view-all:hover {
  background: var(--accent);
  color: var(--bg-primary);
  transform: scale(1.05);
}

.loading-state {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--bg-secondary);
  border-top: 5px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .featured-content h1 { font-size: 2.8rem; }
  .course-card { flex: 0 0 280px; }
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    padding: 2rem 1.5rem;
    text-align: center;
  }
  .featured-recommendation {
    height: auto;
    padding: 4rem 2rem;
  }
  .featured-overlay {
    background: linear-gradient(0deg, var(--bg-primary) 50%, rgba(0,0,0,0.5) 100%);
  }
  .featured-content h1 { font-size: 2.2rem; }
  .section-title { font-size: 1.5rem; padding-left: 1rem; }
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
