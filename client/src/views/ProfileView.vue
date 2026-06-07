<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usersApi } from '../api/users'
import { coursesApi } from '../api/courses'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const profileData = ref(null)
const watchlistCourses = ref([])

const isCurrentUser = computed(() => {
  return authStore.user && authStore.user.username === route.params.username
})

const fetchProfile = async () => {
  if (!route.params.username) {
    loading.value = false;
    profileData.value = null;
    return;
  }
  loading.value = true
  try {
    const data = await usersApi.getUserProfile(route.params.username)
    profileData.value = data
    
    if (isCurrentUser.value) {
      const stored = JSON.parse(localStorage.getItem('libre_watchlist') || '[]')
      if (stored.length > 0) {
        const allCourses = await coursesApi.getAllCourses()
        watchlistCourses.value = allCourses.filter(c => stored.includes(c._id || c.id))
      }
    }
  } catch (err) {
    console.error('Profil yüklenirken hata:', err)
    profileData.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchProfile)
watch(() => route.params.username, fetchProfile)

const getContributionLevel = (count) => {
  if (!count) return 'level-0';
  if (count === 1) return 'level-1';
  if (count <= 3) return 'level-2';
  if (count <= 5) return 'level-3';
  return 'level-4';
}

const contributionDays = computed(() => {
  const days = [];
  const today = new Date();
  // Generate last 60 days
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = profileData.value?.contributions?.[dateStr] || 0;
    days.push({ date: dateStr, count, level: getContributionLevel(count) });
  }
  return days;
})

const genderLabel = computed(() => {
  const mapping = {
    'male': 'Erkek',
    'female': 'Kadın',
    'other': 'Diğer',
    'prefer_not_to_say': 'Belirtmek İstemiyorum'
  };
  return mapping[profileData.value?.gender] || profileData.value?.gender;
})
</script>

<template>
  <div class="profile-view-container container" v-if="!loading && profileData">
    <div class="profile-grid">
      <!-- Left Column: Bio -->
      <aside class="profile-sidebar glass">
        <div class="profile-card">
          <div class="avatar-wrapper">
             <img v-if="profileData.avatar" :src="profileData.avatar" :alt="profileData.name" class="profile-avatar shadow" />
             <div v-else class="profile-avatar-placeholder shadow">
               <i class="bi bi-star-fill" style="font-size: 4rem;"></i>
             </div>
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ profileData.name }}</h2>
            <p class="profile-username">@{{ profileData.username }}</p>
            <div class="profile-details">
              <span v-if="profileData.age"><i class="bi bi-calendar3"></i> Yaş: {{ profileData.age }}</span>
              <span v-if="profileData.gender"><i class="bi bi-gender-ambiguous"></i> {{ genderLabel }}</span>
              <span v-if="profileData.phoneNumber"><i class="bi bi-telephone"></i> {{ profileData.phoneNumber }}</span>
            </div>

            <div class="profile-socials">
              <a v-if="profileData.github" :href="profileData.github" target="_blank" class="social-link github"><i class="bi bi-github"></i></a>
              <span v-if="profileData.google" class="social-link google" :title="profileData.google"><i class="bi bi-google"></i></span>
              <a v-if="profileData.linkedin" :href="profileData.linkedin" target="_blank" class="social-link linkedin"><i class="bi bi-linkedin"></i></a>
            </div>

            <div class="profile-bio-box">
              <p class="profile-bio">{{ profileData.bio || 'Henüz bir açıklama eklenmemiş.' }}</p>
            </div>
            <RouterLink v-if="isCurrentUser" to="/profile/edit" class="edit-profile-btn btn-primary">
              <i class="bi bi-pencil-square"></i> Profili Düzenle
            </RouterLink>
          </div>
        </div>
      </aside>

      <!-- Right Column: Courses -->
      <main class="profile-main">
        <!-- Published Courses (Top) -->
        <section class="courses-section glass mb-8">
          <div class="section-header">
            <h3><i class="bi bi-journal-check"></i> Yayınlanan Kurslarım</h3>
            <RouterLink to="/upload" class="upload-link">
              <i class="bi bi-plus-circle"></i> Yeni Yükle
            </RouterLink>
          </div>
          <div class="course-list" v-if="profileData.publishedCourses?.length">
            <div v-for="course in profileData.publishedCourses" :key="course._id" class="course-mini-card">
              <img :src="course.coverImage || 'https://via.placeholder.com/150'" alt="Course" />
              <div class="mini-info">
                <h4>{{ course.title }}</h4>
                <div class="mini-meta">
                  <span><i class="bi bi-star-fill"></i> {{ course.averageRating }}</span>
                  <span><i class="bi bi-people"></i> 0 Öğrenci</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="bi bi-journal-x"></i>
            <p>Henüz bir kurs yayınlamadınız.</p>
          </div>
        </section>

        <!-- Ongoing & Completed Grid -->
        <div class="courses-grid">
          <section class="courses-section glass">
            <h3><i class="bi bi-play-circle-fill"></i> Devam Edenler</h3>
            <div class="course-list-simple" v-if="profileData.ongoingCourses?.length">
              <div v-for="course in profileData.ongoingCourses" :key="course._id" class="simple-item">
                <span class="dot ongoing"></span>
                <span>{{ course.title }}</span>
                <span class="progress-badge">45%</span>
              </div>
            </div>
            <div v-else class="empty-state-mini">
              <i class="bi bi-play-circle" style="font-size:2rem; opacity:0.5;"></i>
              <p>Devam eden kurs yok.</p>
            </div>
          </section>

          <section class="courses-section glass">
            <h3><i class="bi bi-patch-check-fill"></i> Tamamlananlar</h3>
            <div class="course-list-simple" v-if="profileData.completedCourses?.length">
              <div v-for="course in profileData.completedCourses" :key="course._id" class="simple-item">
                <span class="dot completed"></span>
                <span>{{ course.title }}</span>
                <i class="bi bi-award-fill text-accent ml-auto"></i>
              </div>
            </div>
            <div v-else class="empty-state-mini">
              <i class="bi bi-award" style="font-size:2rem; opacity:0.5;"></i>
              <p>Tamamlanan kurs yok.</p>
            </div>
          </section>
        </div>

        <!-- Watchlist (Only for current user) -->
        <section v-if="isCurrentUser" class="courses-section glass mt-8">
          <h3><i class="bi bi-bookmark-heart-fill"></i> İzleme Listem</h3>
          <div class="course-list-simple" v-if="watchlistCourses.length">
            <RouterLink :to="`/courses/${course.id || course._id}`" v-for="course in watchlistCourses" :key="course._id" class="simple-item" style="text-decoration:none;">
              <i class="bi bi-bookmark-fill" style="color:var(--accent);"></i>
              <span>{{ course.title }}</span>
            </RouterLink>
          </div>
          <div v-else class="empty-state-mini">
            <i class="bi bi-bookmark-x" style="font-size:2rem; opacity:0.5;"></i>
            <p>İzleme listenizde kurs bulunmuyor.</p>
          </div>
        </section>

        <!-- User Reviews -->
        <section class="courses-section glass mt-8" v-if="profileData.reviews?.length">
          <h3><i class="bi bi-chat-left-text-fill"></i> Değerlendirmeleri</h3>
          <div class="review-list" style="display:flex; flex-direction:column; gap:1rem;">
            <div v-for="review in profileData.reviews" :key="review.id" class="review-item" style="background:var(--bg-primary); padding:1rem; border-radius:8px; border:1px solid var(--border-color);">
              <div class="review-header" style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                <strong><RouterLink :to="`/courses/${review.course?.id}`" style="color:var(--accent);">{{ review.course?.title }}</RouterLink> {{ review.lesson ? `(${review.lesson.title})` : '' }}</strong>
                <span class="stars"><i v-for="i in 5" :key="i" class="bi" :class="i <= review.rating ? 'bi-star-fill' : 'bi-star'"></i></span>
              </div>
              <p style="color:var(--text-secondary); margin:0;">{{ review.comment }}</p>
            </div>
          </div>
        </section>

        <!-- Contributions Graph -->
        <section class="courses-section glass mt-8">
          <h3><i class="bi bi-calendar2-week"></i> Etkinlikler</h3>
          <div class="contribution-graph">
            <div class="graph-grid">
              <div 
                v-for="(day, index) in contributionDays" 
                :key="index" 
                class="graph-cell" 
                :class="day.level"
                :title="`${day.date}: ${day.count} etkinlik`"
              ></div>
            </div>
            <div class="graph-legend">
              <span>Az</span>
              <div class="graph-cell level-0"></div>
              <div class="graph-cell level-1"></div>
              <div class="graph-cell level-2"></div>
              <div class="graph-cell level-3"></div>
              <div class="graph-cell level-4"></div>
              <span>Çok</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
  <div v-else-if="loading" class="loading-full">
    <div class="spinner-large"></div>
    <p>Profil yükleniyor...</p>
  </div>
  <div v-else class="error-state">
     <i class="bi bi-person-x-fill"></i>
     <p>Kullanıcı bulunamadı veya bir hata oluştu.</p>
     <RouterLink to="/" class="btn mt-4">Ana Sayfaya Dön</RouterLink>
  </div>
</template>

<style scoped>
.profile-view-container {
  padding: 3rem 1rem;
  min-height: 80vh;
}

.profile-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.glass {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

/* Sidebar Styling */
.profile-sidebar {
  position: sticky;
  top: 100px;
}

.avatar-wrapper {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.profile-avatar, .profile-avatar-placeholder {
  width: 160px;
  height: 160px;
  border-radius: 40px;
  object-fit: cover;
  border: 4px solid var(--accent);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  font-family: 'Hermit', monospace;
  color: var(--accent);
  transition: transform 0.3s ease;
}

.profile-avatar:hover {
  transform: rotate(-3deg) scale(1.05);
}

.profile-info {
  text-align: center;
}

.profile-name {
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-family: 'Hermit', monospace;
}

.profile-username {
  color: var(--accent);
  font-weight: 600;
  margin-bottom: 1rem;
}

.profile-details {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.profile-details span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.profile-socials {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1.2rem;
  transition: all 0.3s;
  border: 1px solid var(--border-color);
}

.social-link:hover {
  transform: translateY(-3px);
}

.social-link.github:hover { color: #fff; background: #333; border-color: #333; }
.social-link.google:hover { color: #fff; background: #ea4335; border-color: #ea4335; }
.social-link.linkedin:hover { color: #fff; background: #0077b5; border-color: #0077b5; }

.profile-bio-box {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 0 12px 12px 0; /* Changed to make left border straight */
  margin-bottom: 2rem;
  border-left: 5px solid var(--accent); /* Made the border more solid */
}

.profile-bio {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

.edit-profile-btn {
  width: 100%;
  justify-content: center;
  padding: 0.8rem;
  font-size: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
}

/* Main Content Styling */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h3 {
  margin-bottom: 0;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.upload-link {
  color: var(--accent);
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.course-mini-card {
  display: flex;
  gap: 0.75rem;
  background: var(--bg-primary);
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
  align-items: center;
}

.course-mini-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.course-mini-card img {
  width: 70px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
}

.mini-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mini-info h4 {
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
  color: var(--text-primary);
  line-height: 1.2;
}

.mini-meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  gap: 1rem;
}

.mini-meta i {
  color: var(--accent);
}

.courses-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }
}

.course-list-simple {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.simple-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.ongoing { background: #fabd2f; box-shadow: 0 0 10px #fabd2f66; }
.completed { background: #b8bb26; box-shadow: 0 0 10px #b8bb2666; }

.progress-badge {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--accent);
}

.empty-state, .empty-state-mini {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  opacity: 0.3;
  margin-bottom: 1rem;
  display: block;
}

.loading-full, .error-state {
  height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid var(--bg-card);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.mt-8 {
  margin-top: 2rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

/* Contribution Graph */
.contribution-graph {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.graph-grid {
  display: flex;
  gap: 4px;
}

.graph-cell {
  width: 15px;
  height: 15px;
  border-radius: 3px;
  background-color: var(--bg-primary);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

[data-theme="dark"] .graph-cell {
  border-color: rgba(255, 255, 255, 0.05);
}

.graph-cell.level-0 { background-color: var(--bg-primary); }
.graph-cell.level-1 { background-color: rgba(215, 153, 33, 0.3); } /* Accent color with opacity */
.graph-cell.level-2 { background-color: rgba(215, 153, 33, 0.6); }
.graph-cell.level-3 { background-color: rgba(215, 153, 33, 0.8); }
.graph-cell.level-4 { background-color: var(--accent); }

.graph-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  align-self: flex-end;
}
</style>
