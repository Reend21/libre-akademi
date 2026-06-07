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

const loading = ref(authStore.isLoggedIn)
const homeData = ref({ featured: null, popular: [], categories: [] })

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

// Intersection Observer for scroll animations
onMounted(() => {
  fetchHomeData()
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view')
      }
    })
  }, { threshold: 0.2 })

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
})

const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/400x225?text=Libre+Akademi'
  if (path.startsWith('http')) return path
  if (path.startsWith('/uploads')) return path // Use relative for proxy
  return `${API_BASE}${path}`
}

const orbitItems = [
  { icon: 'bi-journal-richtext', text: 'Nitelikli Eğitim', color: '#fabd2f' },
  { icon: 'bi-file-earmark-code', text: 'Açık Kaynak', color: '#b8bb26' },
  { icon: 'bi-shield-check', text: 'Gizlilik Odaklı', color: '#fb4934' },
  { icon: 'bi-people', text: 'Geniş Topluluk', color: '#83a598' }
]

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
      <!-- Full Width Hero -->
      <section class="hero-premium">
        <div class="hero-bg-overlay"></div>
        <div class="hero-container container">
          <div class="hero-content">
            <div class="hero-badge animate-fade-in">
              <i class="bi bi-stars"></i> Geleceğin Özgür Akademisi
            </div>
            <h1 class="animate-slide-up">Bilgiyi <span class="accent-glow">Özgürce</span> Paylaşın ve Öğrenin</h1>
            <p class="animate-slide-up delay-1">Libre Akademi, AGPL Lisansı ile dağıtılan açık kaynak ve topluluk odaklı bir çevrimiçi öğrenme platformudur.</p>
            
            <div class="hero-actions animate-slide-up delay-2">
              <RouterLink to="/courses" class="btn-hero-primary">
                <i class="bi bi-search"></i> Keşfetmeye Başla
              </RouterLink>
              <RouterLink to="/login" class="btn-hero-secondary">
                Eğitmen Ol <i class="bi bi-arrow-right"></i>
              </RouterLink>
            </div>
          </div>

          <div class="hero-visual-orbits">
            <div class="logo-center">
              <img :src="heroLogo" alt="Libre Akademi" class="main-logo-glow" />
            </div>
            <div v-for="(item, index) in orbitItems" :key="index" :class="'orbit orbit-' + (index + 1)">
              <div class="orbit-content" :style="{ '--item-color': item.color }">
                <i :class="'bi ' + item.icon"></i>
                <span>{{ item.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section container">
        <div class="section-header animate-on-scroll">
          <h2>Neden Libre Akademi?</h2>
          <div class="header-line"></div>
        </div>
        
        <div class="info-grid">
          <div 
            v-for="(card, index) in infoCards" 
            :key="index" 
            class="info-card-modern animate-on-scroll"
            :style="{ transitionDelay: (index * 0.1) + 's' }"
          >
            <div class="card-icon-wrapper">
              <i :class="'bi ' + card.icon"></i>
            </div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.desc }}</p>
          </div>
        </div>
      </section>

      <section class="cta-banner container animate-on-scroll">
        <div class="cta-inner glass">
          <div class="cta-text">
            <h2>Hemen aramıza katılın!</h2>
            <p>Binlerce öğrenci ve eğitmenle birlikte bilginin gücünü keşfedin.</p>
          </div>
          <RouterLink to="/register" class="btn-cta-gold">
            Şimdi Kayıt Ol <i class="bi bi-person-plus"></i>
          </RouterLink>
        </div>
      </section>
    </template>

    <!-- Logged In View -->
    <template v-else>
      <div class="auth-home-content">
        <!-- Skeleton Loading State -->
        <div v-if="loading" class="skeleton-wrapper container mt-4">
          <div class="skeleton-featured"></div>
          <div class="skeleton-section mt-8">
            <div class="skeleton-title"></div>
            <div class="skeleton-scroll">
              <div v-for="i in 5" :key="i" class="skeleton-card"></div>
            </div>
          </div>
        </div>
        
        <!-- Authenticated Content -->
        <div v-else class="auth-container">
          <!-- Editor's Recommendation (Featured) -->
          <section v-if="homeData.featured" class="featured-hero-auth animate-fade-in">
            <div class="featured-overlay"></div>
            <img :src="getImageUrl(homeData.featured.coverImage)" alt="Featured Course" class="featured-bg">
            <div class="featured-content container-fluid">
              <div class="featured-text">
                <span class="badge-featured">Editörün Önerisi</span>
                <h1>{{ homeData.featured.title }}</h1>
                <p>{{ homeData.featured.description?.slice(0, 180) }}...</p>
                <div class="featured-meta">
                  <span><i class="bi bi-play-circle"></i> {{ homeData.featured.lessons?.length || 0 }} Ders</span>
                  <div class="rating-stars">
                    <i v-for="i in 5" :key="i" class="bi" :class="i <= Math.round(homeData.featured.averageRating) ? 'bi-star-fill' : 'bi-star'"></i>
                    <span>{{ (homeData.featured.averageRating || 0).toFixed(1) }}</span>
                  </div>
                </div>
                <RouterLink :to="'/courses/' + homeData.featured._id" class="btn-featured-visit">
                  Kursu İncele <i class="bi bi-arrow-right"></i>
                </RouterLink>
              </div>
            </div>
          </section>

          <!-- Empty State -->
          <div v-if="!homeData.featured && homeData.popular.length === 0 && homeData.categories.length === 0" class="empty-home-state container">
             <div class="empty-hero-full glass animate-fade-in">
               <i class="bi bi-wind icon-empty"></i>
               <h2>Buralar hep dutluktu...</h2>
               <p>Görünüşe göre sistemde henüz hiç kurs yok. İlk kursu sen yüklemek ister misin?</p>
               <RouterLink to="/upload" class="btn-hero-primary mt-4">
                 <i class="bi bi-plus-circle"></i> İlk Kursu Yükle
               </RouterLink>
             </div>
             
             <div class="placeholder-grid mt-8">
               <div v-for="i in 4" :key="i" class="placeholder-card-ghost">
                 <div class="ghost-thumb"></div>
                 <div class="ghost-line"></div>
                 <div class="ghost-line short"></div>
               </div>
             </div>
          </div>

          <!-- Vertical Course List for Logged In Users -->
          <div v-else class="courses-list-container container mt-8">
            <!-- Popular Courses -->
            <section class="horizontal-section" v-if="homeData.popular.length">
              <div class="section-title-wrapper">
                <h2 class="section-title">Popüler Kurslar</h2>
                <RouterLink to="/courses" class="see-all">Hepsini Gör</RouterLink>
              </div>
              <div class="scroll-container">
                <RouterLink 
                  v-for="course in homeData.popular" 
                  :key="course._id" 
                  :to="'/courses/' + course._id"
                  class="course-card-modern"
                >
                  <div class="course-thumb">
                    <img :src="getImageUrl(course.coverImage)" :alt="course.title">
                    <div class="play-hint"><i class="bi bi-play-fill"></i></div>
                  </div>
                  <div class="course-body">
                    <h3>{{ course.title }}</h3>
                    <div class="course-footer">
                      <span class="lesson-tag">{{ course.lessons?.length || 0 }} Ders</span>
                      <span class="rating"><i class="bi bi-star-fill"></i> {{ course.averageRating?.toFixed(1) }}</span>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </section>

            <!-- Category Sections -->
            <section class="horizontal-section" v-for="cat in homeData.categories" :key="cat.name">
              <div class="section-title-wrapper">
                <h2 class="section-title">{{ cat.name }}</h2>
              </div>
              <div class="scroll-container">
                <RouterLink 
                  v-for="course in cat.courses" 
                  :key="course._id" 
                  :to="'/courses/' + course._id"
                  class="course-card-modern"
                >
                  <div class="course-thumb">
                    <img :src="getImageUrl(course.coverImage)" :alt="course.title">
                  </div>
                  <div class="course-body">
                    <h3>{{ course.title }}</h3>
                    <div class="course-footer">
                      <span class="lesson-tag">{{ course.lessonCount || 0 }} Ders</span>
                      <span class="rating"><i class="bi bi-star-fill"></i> {{ (course.averageRating || 0).toFixed(1) }}</span>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </section>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
}

/* --- Premium Hero Section --- */
.hero-premium {
  position: relative;
  width: 100vw;
  height: 90vh;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-top: -80px; /* Overlap navbar */
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 70% 30%, var(--accent) 0%, transparent 40%),
              radial-gradient(circle at 20% 80%, rgba(152, 151, 26, 0.15) 0%, transparent 40%);
  opacity: 0.15;
  filter: blur(80px);
  z-index: 1;
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  z-index: 2;
  gap: 4rem;
  max-width: 1400px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero-badge {
  background: rgba(250, 189, 47, 0.1);
  color: var(--accent);
  padding: 0.5rem 1.2rem;
  border-radius: 50px;
  width: fit-content;
  font-weight: 800;
  font-size: 0.9rem;
  border: 1px solid rgba(250, 189, 47, 0.2);
}

.hero-content h1 {
  font-size: 5rem;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -2px;
}

.accent-glow {
  color: var(--accent);
  text-shadow: 0 0 30px rgba(250, 189, 47, 0.3);
}

.hero-content p {
  font-size: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.btn-hero-primary {
  background: var(--accent);
  color: #1d2021;
  padding: 1.2rem 2.5rem;
  border-radius: 16px;
  font-weight: 800;
  font-size: 1.1rem;
  box-shadow: 0 10px 30px -10px var(--accent);
  transition: all 0.3s;
}

.btn-hero-secondary {
  background: rgba(235, 219, 178, 0.05);
  color: var(--text-primary);
  padding: 1.2rem 2.5rem;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.1rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.btn-hero-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 40px -10px var(--accent); }
.btn-hero-secondary:hover { background: rgba(235, 219, 178, 0.1); border-color: var(--accent); }

/* --- Orbiting Visuals --- */
.hero-visual-orbits {
  position: relative;
  width: 100%;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-center {
  width: 280px;
  height: 280px;
  z-index: 10;
  filter: drop-shadow(0 0 50px rgba(250, 189, 47, 0.2));
}

.main-logo-glow {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.orbit {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(102, 92, 84, 0.2);
  border-radius: 50%;
  animation: rotate linear infinite;
}

.orbit-content {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-card);
  padding: 0.8rem 1.2rem;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.orbit-content i { font-size: 1.5rem; color: var(--item-color); }
.orbit-content span { font-weight: 800; font-size: 0.85rem; color: var(--text-primary); }

.orbit-1 { width: 500px; height: 500px; animation-duration: 20s; }
.orbit-2 { width: 400px; height: 400px; animation-duration: 25s; animation-direction: reverse; }
.orbit-3 { width: 550px; height: 550px; animation-duration: 30s; }
.orbit-4 { width: 450px; height: 450px; animation-duration: 35s; animation-direction: reverse; }

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* --- Features Section --- */
.features-section {
  padding: 8rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 5rem;
}

.section-header h2 { font-size: 3rem; font-weight: 900; }
.header-line { width: 80px; height: 6px; background: var(--accent); margin: 1.5rem auto; border-radius: 10px; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
}

.info-card-modern {
  background: var(--bg-card);
  padding: 3rem 2rem;
  border-radius: 32px;
  border: 1px solid var(--border-color);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.info-card-modern:hover {
  transform: translateY(-10px);
  border-color: var(--accent);
  box-shadow: 0 30px 60px -15px rgba(0,0,0,0.3);
}

.card-icon-wrapper {
  width: 70px; height: 70px;
  background: rgba(250, 189, 47, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: var(--accent);
}

.info-card-modern h3 { font-size: 1.6rem; margin-bottom: 1rem; font-weight: 800; }
.info-card-modern p { color: var(--text-secondary); font-size: 1.1rem; line-height: 1.6; }

/* --- CTA Banner --- */
.cta-banner { padding-bottom: 8rem; }
.cta-inner {
  padding: 4rem 6rem;
  border-radius: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(250, 189, 47, 0.1) 0%, transparent 100%);
}

.cta-text h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; }
.cta-text p { font-size: 1.2rem; color: var(--text-secondary); }

.btn-cta-gold {
  background: var(--accent);
  color: #1d2021;
  padding: 1.2rem 3rem;
  border-radius: 20px;
  font-weight: 900;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s;
}

.btn-cta-gold:hover { transform: scale(1.05); box-shadow: 0 15px 30px rgba(250, 189, 47, 0.2); }

/* --- Auth Home Content --- */
.auth-container { padding-bottom: 5rem; }

.featured-hero-auth {
  position: relative;
  height: 550px;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-top: -80px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.featured-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; z-index: 1; }
.featured-overlay { 
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
  background: linear-gradient(90deg, var(--bg-primary) 30%, rgba(29, 32, 33, 0.6) 70%, transparent 100%); 
  z-index: 2; 
}

.featured-text { position: relative; z-index: 3; max-width: 800px; display: flex; flex-direction: column; gap: 1.8rem; margin-left: 3rem;}
.badge-featured { 
  background: rgba(250, 189, 47, 0.2); 
  color: var(--accent); 
  padding: 0.5rem 1.5rem; 
  border-radius: 50px; 
  font-weight: 900; 
  width: fit-content; 
  border: 1px solid var(--accent);
  backdrop-filter: blur(5px);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.85rem;
}
.featured-text h1 { font-size: 4.5rem; font-weight: 900; line-height: 1.1; letter-spacing: -2px; }
.featured-text p { font-size: 1.4rem; color: var(--text-secondary); line-height: 1.7; max-width: 700px; }

.rating-stars { display: flex; align-items: center; gap: 0.5rem; color: var(--accent); font-weight: 800; }

.horizontal-section { margin-bottom: 5rem; }
.section-title-wrapper { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
.section-title { font-size: 2.4rem; font-weight: 900; border-left: 10px solid var(--accent); padding-left: 1.8rem; }
.see-all { color: var(--accent); font-weight: 700; font-size: 1.1rem; }

.scroll-container { display: flex; gap: 2.5rem; overflow-x: auto; padding-bottom: 2.5rem; padding-left: 0.5rem; }

.course-card-modern {
  flex: 0 0 380px;
  background: var(--bg-card);
  border-radius: 30px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
}

.course-card-modern:hover { 
  transform: translateY(-12px) scale(1.02); 
  border-color: var(--accent); 
  box-shadow: 0 20px 40px -15px rgba(250, 189, 47, 0.2);
}

.course-thumb { height: 200px; position: relative; overflow: hidden; }
.course-thumb img { width: 100%; height: 100%; object-fit: cover; }
.play-hint {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 3rem; opacity: 0; transition: 0.3s;
}
.course-card-modern:hover .play-hint { opacity: 1; }

.course-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.course-body h3 { font-size: 1.4rem; font-weight: 800; height: 3.4rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

.course-footer { display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 1rem; }
.lesson-tag { color: var(--text-secondary); font-weight: 700; }
.rating { color: var(--accent); font-weight: 800; }

/* --- Scroll Animations --- */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.33, 1, 0.68, 1);
}

.animate-on-scroll.in-view {
  opacity: 1;
  transform: translateY(0);
}

.animate-fade-in { animation: fadeIn 1s ease-out forwards; }
.animate-slide-up { opacity: 0; animation: slideUp 0.8s cubic-bezier(0.33, 1, 0.68, 1) forwards; }
.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { 
  from { opacity: 0; transform: translateY(40px); } 
  to { opacity: 1; transform: translateY(0); } 
}

/* --- Empty States --- */
.empty-home-state { padding: 4rem 2rem; text-align: center; }
.empty-hero-full { 
  padding: 6rem 4rem; 
  border-radius: 40px; 
  margin-bottom: 4rem; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 2rem;
  background: linear-gradient(135deg, rgba(250, 189, 47, 0.05) 0%, transparent 100%);
}
.icon-empty { font-size: 6rem; color: var(--accent); opacity: 0.6; animation: float 4s ease-in-out infinite; }
.placeholder-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
  gap: 2.5rem; 
  opacity: 0.2; 
  pointer-events: none;
}
.placeholder-card-ghost { 
  background: var(--bg-card); 
  padding: 1.5rem; 
  border-radius: 28px; 
  border: 2px dashed var(--border-color); 
}
.ghost-thumb { height: 180px; background: var(--bg-secondary); border-radius: 20px; margin-bottom: 1.5rem; }
.ghost-line { height: 15px; background: var(--bg-secondary); border-radius: 6px; margin-bottom: 1rem; width: 100%; }
.ghost-line.short { width: 60%; }

/* --- Responsiveness --- */
@media (max-width: 1200px) {
  .hero-container { grid-template-columns: 1fr; text-align: center; height: auto; padding: 10rem 2rem; }
  .hero-content { align-items: center; }
  .hero-visual-orbits { height: 400px; transform: scale(0.7); }
  .info-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .hero-content h1 { font-size: 3rem; }
  .info-grid { grid-template-columns: 1fr; }
  .cta-inner { flex-direction: column; text-align: center; gap: 2rem; padding: 3rem 2rem; }
  .featured-text h1 { font-size: 2.5rem; }
  .course-card-modern { flex: 0 0 280px; }
}
</style>
