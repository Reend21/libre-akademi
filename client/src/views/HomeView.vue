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

const loading = ref(authStore.isLoggedIn) // Start loading if logged in
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
      <div class="auth-home-content">
        <!-- Skeleton Loading State -->
        <div v-if="loading" class="skeleton-wrapper">
          <div class="skeleton-featured"></div>
          <div class="skeleton-section">
            <div class="skeleton-title"></div>
            <div class="skeleton-scroll">
              <div v-for="i in 5" :key="i" class="skeleton-card"></div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!homeData.featured && homeData.popular.length === 0 && homeData.categories.length === 0" class="empty-home-state">
           <div class="empty-hero glass">
             <i class="bi bi-wind icon-empty"></i>
             <h2>Henüz burada keşfedilecek bir şey yok...</h2>
             <p>Görünüşe göre sistemde henüz hiç kurs yok. İlk kursu sen yüklemek ister misin?</p>
             <RouterLink to="/upload" class="btn btn-upload-first">
               <i class="bi bi-plus-circle"></i> İlk Kursu Yükle
             </RouterLink>
           </div>
           
           <div class="placeholder-grid">
             <div v-for="i in 3" :key="i" class="placeholder-card-ghost">
               <div class="ghost-thumb"></div>
               <div class="ghost-line"></div>
               <div class="ghost-line short"></div>
             </div>
           </div>
        </div>

        <!-- Authenticated Content -->
        <div v-else>
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
        </div>

        <!-- View All Button -->
        <section v-if="!loading" class="view-all-section">
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

/* --- Shared Components --- */
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
[data-theme="dark"] .btn { color: var(--bg-primary); }

.btn-outline {
  background: transparent;
  color: var(--accent);
  border: 2px solid var(--accent);
}
.btn-outline:hover { background: var(--accent); color: #fff; }

/* --- Logged Out Hero --- */
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
  border-radius: 50%;
  pointer-events: none;
}
.hero-content { flex: 1; display: flex; flex-direction: column; gap: 1.2rem; }
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
[data-theme="dark"] .hero-badge { color: var(--bg-primary); }
.hero h1 { font-size: 3.8rem; font-weight: 900; line-height: 1.1; color: var(--text-primary); }
.highlight { color: var(--accent); }
.hero p { font-size: 1.15rem; color: var(--text-secondary); max-width: 520px; line-height: 1.7; }
.hero-visual { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.hero-logo { width: 240px; height: 240px; object-fit: contain; animation: float 4s ease-in-out infinite; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

/* --- Stats Section --- */
.stats { padding: 0 1rem; gap: 2rem; margin: 0 auto 5rem auto; max-width: 1100px; width: 100%; }
.stat-card {
  flex: 1;
  background-color: var(--bg-card);
  padding: 1.75rem 1.5rem;
  text-align: center;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  transition: all 0.2s;
}
.stat-card h3 { font-size: 2.5rem; color: var(--accent); margin-bottom: 0.4rem; font-weight: 800; }
.stat-icon { font-size: 2rem; color: var(--accent); display: block; margin-bottom: 0.75rem; }

/* --- Info Cards --- */
.info-cards { display: flex; flex-direction: column; width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; }
.info-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-card);
  padding: 3rem 10vw;
  border-top: 1px solid var(--border-color);
  width: 100%;
  gap: 4rem;
}
.info-card:nth-child(even) { background-color: var(--bg-secondary); }
.info-card.reverse { flex-direction: row-reverse; }
.info-content h2 { font-size: 2.8rem; color: var(--accent); margin-bottom: 0.8rem; font-weight: 800; }
.info-content p { font-size: 1.5rem; color: var(--text-secondary); line-height: 1.6; }
.info-icon { font-size: 5rem; color: var(--accent); width: 150px; display: flex; justify-content: center; }

/* --- CTA --- */
.cta-section { display: flex; justify-content: center; padding: 5rem 1rem; }
.cta-card {
  background-color: var(--bg-card);
  padding: 3.5rem 5rem;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}
.btn-register {
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 2px solid var(--accent);
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-weight: 700;
}

/* --- Authenticated Content --- */
.auth-home-content { display: flex; flex-direction: column; gap: 3rem; width: 100%; }

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
.featured-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; }
.featured-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, var(--bg-primary) 30%, transparent 100%); z-index: 2; }
.featured-content { position: relative; z-index: 3; max-width: 600px; display: flex; flex-direction: column; gap: 1.5rem; }
.badge-featured { background: var(--accent); color: var(--bg-primary); padding: 0.4rem 1rem; border-radius: 4px; font-weight: 800; font-size: 0.9rem; width: fit-content; }
.featured-content h1 { font-size: 3.5rem; line-height: 1.1; }
.featured-meta { display: flex; gap: 2rem; font-weight: 700; }
.text-yellow { color: #fabd2f; }
.btn-featured-visit {
  background: var(--accent);
  color: var(--bg-primary);
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
}

.course-section { padding: 0 2rem; display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; }
.section-title { font-size: 2rem; border-left: 6px solid var(--accent); padding-left: 1.5rem; }
.horizontal-scroll { display: flex; gap: 1.5rem; overflow-x: auto; padding-bottom: 1.5rem; }

.course-card {
  flex: 0 0 320px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 2px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s;
}
.course-card:hover { transform: translateY(-5px); border-color: var(--accent); }
.course-thumb { height: 180px; overflow: hidden; }
.course-thumb img { width: 100%; height: 100%; object-fit: cover; transition: 0.3s; }
.course-card:hover .course-thumb img { transform: scale(1.05); }
.course-info { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.course-info h3 { font-size: 1.25rem; height: 3.2rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.course-stats { display: flex; justify-content: space-between; font-weight: 700; color: var(--text-secondary); }
.rating { color: var(--accent); display: flex; align-items: center; gap: 0.3rem; }

.view-all-section { display: flex; justify-content: center; padding: 3rem 0; }
.btn-view-all { border: 3px solid var(--accent); color: var(--accent); padding: 1rem 3rem; border-radius: 50px; font-weight: 900; display: flex; align-items: center; gap: 0.8rem; }
.btn-view-all:hover { background: var(--accent); color: var(--bg-primary); }

/* --- Skeleton & Empty States --- */
.skeleton-wrapper { padding: 0 4rem; display: flex; flex-direction: column; gap: 3rem; }
.skeleton-featured { height: 450px; background: var(--bg-card); border-radius: 32px; animation: pulse 1.5s infinite; }
.skeleton-title { width: 200px; height: 30px; background: var(--bg-card); border-radius: 8px; animation: pulse 1.5s infinite; }
.skeleton-scroll { display: flex; gap: 1.5rem; overflow: hidden; }
.skeleton-card { min-width: 280px; height: 200px; background: var(--bg-card); border-radius: 20px; animation: pulse 1.5s infinite; }

@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

.empty-home-state { padding: 2rem 4rem; text-align: center; }
.empty-hero { padding: 4rem; border-radius: 32px; margin-bottom: 3rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
.icon-empty { font-size: 5rem; color: var(--accent); opacity: 0.5; }
.btn-upload-first { background: var(--accent); color: #fff; padding: 1rem 2rem; border-radius: 12px; font-weight: 700; }
.placeholder-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; opacity: 0.3; }
.placeholder-card-ghost { background: var(--bg-card); padding: 1.5rem; border-radius: 24px; border: 2px dashed var(--border-color); }
.ghost-thumb { height: 160px; background: var(--bg-secondary); border-radius: 16px; margin-bottom: 1.5rem; }
.ghost-line { height: 15px; background: var(--bg-secondary); border-radius: 4px; margin-bottom: 0.8rem; }
.ghost-line.short { width: 60%; }

/* --- Responsiveness --- */
@media (max-width: 1024px) {
  .featured-content h1 { font-size: 2.8rem; }
  .course-card { flex: 0 0 280px; }
}

@media (max-width: 768px) {
  .hero { flex-direction: column; padding: 2rem 1.5rem; text-align: center; }
  .hero h1 { font-size: 2.5rem; }
  .hero-logo { width: 160px; height: 160px; }
  .stats { flex-direction: column; }
  .info-card, .info-card.reverse { flex-direction: column; text-align: center; padding: 2rem; }
  .featured-recommendation { height: auto; padding: 4rem 2rem; }
  .featured-overlay { background: linear-gradient(0deg, var(--bg-primary) 50%, rgba(0,0,0,0.5) 100%); }
  .featured-content h1 { font-size: 2.2rem; }
  .skeleton-wrapper, .empty-home-state { padding: 1rem; }
}
</style>
