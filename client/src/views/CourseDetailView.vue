<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { coursesApi } from '../api/courses'
import { API_BASE } from '../api/client'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const course = ref(null)
const loading = ref(true)
const error = ref('')
const currentLessonIndex = ref(null) // Start with null for course overview
const videoPlayerRef = ref(null)

const saveVideoProgress = () => {
  if (!videoPlayerRef.value || !currentLesson()) return
  const time = videoPlayerRef.value.currentTime
  const lessonId = currentLesson().id || currentLesson()._id
  if (time > 5) { // Only save if watched for more than 5 seconds
    localStorage.setItem(`libre_akademi_video_progress_${lessonId}`, time)
  }
}

const restoreVideoProgress = () => {
  if (!videoPlayerRef.value || !currentLesson()) return
  const lessonId = currentLesson().id || currentLesson()._id
  const savedTime = localStorage.getItem(`libre_akademi_video_progress_${lessonId}`)
  if (savedTime && parseFloat(savedTime) > 0) {
    videoPlayerRef.value.currentTime = parseFloat(savedTime)
  }
}

// Deletion Modal State
const showDeleteModal = ref(false)
const deleteConfirmation = ref({
  checkbox: false,
  username: '',
  courseTitle: ''
})
const deleteLoading = ref(false)

const newReview = ref({ rating: 0, comment: '' })
const submittingReview = ref(false)

const currentReviews = computed(() => {
  if (!course.value) return []
  if (currentLesson()) {
    return currentLesson().reviews || []
  }
  return course.value.reviews || []
})

const submitReview = async () => {
  if (newReview.value.rating === 0) return alert('Lütfen puan verin.')
  if (!newReview.value.comment.trim()) return alert('Lütfen yorum yazın.')
  
  submittingReview.value = true
  try {
    const data = {
      rating: newReview.value.rating,
      comment: newReview.value.comment,
      lessonId: currentLesson() ? currentLesson().id || currentLesson()._id : null
    }
    await coursesApi.addReview(authStore.token, course.value.id || course.value._id, data)
    course.value = await coursesApi.getCourse(route.params.id)
    newReview.value = { rating: 0, comment: '' }
  } catch (err) {
    alert(err.message || 'Değerlendirme gönderilemedi.')
  } finally {
    submittingReview.value = false
  }
}

const watchlist = ref(JSON.parse(localStorage.getItem('libre_watchlist') || '[]'))

const isInWatchlist = computed(() => {
  if (!course.value) return false
  return watchlist.value.includes(course.value.id || course.value._id)
})

const toggleWatchlist = () => {
  const cId = course.value?.id || course.value?._id
  if (!cId) return
  if (isInWatchlist.value) {
    watchlist.value = watchlist.value.filter(id => id !== cId)
  } else {
    watchlist.value.push(cId)
  }
  localStorage.setItem('libre_watchlist', JSON.stringify(watchlist.value))
}

const isOwner = computed(() => {
  if (!course.value || !authStore.user) return false
  return parseInt(course.value.instructorId) === parseInt(authStore.user._id || authStore.user.id)
})

const canDelete = computed(() => {
  return deleteConfirmation.value.checkbox && 
         deleteConfirmation.value.username === authStore.user?.username &&
         deleteConfirmation.value.courseTitle === course.value?.title
})

onMounted(async () => {
  try {
    course.value = await coursesApi.getCourse(route.params.id)
  } catch (err) {
    error.value = err.message || 'Kurs yüklenemedi.'
  } finally {
    loading.value = false
  }
})

const currentLesson = () => {
  if (currentLessonIndex.value === null || !course.value?.lessons?.length) return null
  return course.value.lessons[currentLessonIndex.value]
}

const getVideoUrl = (url) => {
  if (!url) return ''
  // If it's a local upload, use relative path to avoid CORS/ORB issues via Nginx proxy
  if (url.startsWith('/uploads')) return url
  return url.startsWith('/') ? `${API_BASE}${url}` : url
}

const selectLesson = (index) => {
  currentLessonIndex.value = index
}

const seekVideo = (time) => {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.currentTime = time
    videoPlayerRef.value.play()
  }
}

const parsedTimestamps = computed(() => {
  if (!currentLesson()?.timestamps) return []
  const lines = currentLesson().timestamps.split('\n')
  return lines.map(line => {
    const match = line.match(/^(\d{1,2}:)?(\d{1,2}):(\d{2})/)
    if (match) {
      const timeStr = match[0]
      const label = line.replace(timeStr, '').trim()
      const parts = timeStr.split(':').map(Number)
      let time = 0
      if (parts.length === 3) time = parts[0]*3600 + parts[1]*60 + parts[2]
      else time = parts[0]*60 + parts[1]
      return { time, display: timeStr, label: label || 'Bölüm' }
    }
    return null
  }).filter(Boolean)
})

const handleDeleteCourse = async () => {
  if (!canDelete.value) return
  
  deleteLoading.value = true
  try {
    await coursesApi.deleteCourse(authStore.token, course.value._id)
    router.push('/courses')
  } catch (err) {
    alert(err.message || 'Kurs silinirken bir hata oluştu.')
  } finally {
    deleteLoading.value = false
    showDeleteModal.value = false
  }
}
</script>

<template>
  <div class="course-detail-page" v-if="!loading && course">
    <div class="course-detail-container container">
      <!-- Main Content (Left) -->
      <div class="main-player-section">
        <!-- Video Player / Overview Image -->
        <div class="video-wrapper glass">
          <video 
            v-if="currentLesson()" 
            ref="videoPlayerRef"
            controls 
            class="video-player" 
            :key="currentLessonIndex" 
            :src="getVideoUrl(currentLesson().videoUrl)"
            crossorigin="anonymous"
            autoplay
            @timeupdate="saveVideoProgress"
            @loadedmetadata="restoreVideoProgress"
          >
            Tarayıcınız video etiketini desteklemiyor.
          </video>
          <div v-else class="overview-placeholder" :style="{ backgroundImage: `url(${course.coverImage ? getVideoUrl(course.coverImage) : '/placeholder-course.jpg'})` }">
            <div class="overlay">
              <i class="bi bi-play-circle-fill"></i>
              <p>Öğrenmeye başlamak için sağdan bir ders seçin</p>
            </div>
          </div>
        </div>

        <!-- Video/Course Info -->
        <div class="info-card glass mt-4">
          <div class="info-header">
            <div class="header-main">
              <div class="current-lesson-info" v-if="currentLesson()">
                <span class="lesson-count-badge">Ders {{ currentLessonIndex + 1 }}</span>
                <h2>{{ currentLesson().title }}</h2>
              </div>
              <div class="course-title-info" v-else>
                <span class="lesson-count-badge overview">KURS ÖZETİ</span>
                <h2>{{ course.title }}</h2>
              </div>
              
              <div class="header-actions">
                <!-- Watchlist Button -->
                <button @click="toggleWatchlist" class="btn btn-outline btn-sm" :title="isInWatchlist ? 'Listeden Çıkar' : 'İzleme Listesine Ekle'" style="padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                  <i class="bi" :class="isInWatchlist ? 'bi-bookmark-fill' : 'bi-bookmark'" style="color: var(--accent);"></i>
                  {{ isInWatchlist ? 'Listede' : 'İzleme Listesi' }}
                </button>
                
                <!-- Donation Button (Pink Theme) -->
                <button v-if="course.donationEnabled" class="donation-btn" title="Eğitmene Bağış Yap">
                  <i class="bi bi-heart-fill"></i>
                  Bağış Yap
                </button>

                <!-- Delete Option for Owner -->
                <button v-if="isOwner" @click="showDeleteModal = true" class="delete-trigger-btn" title="Kursu Sil">
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="instructor-meta mt-4">
            <div class="instructor-info" v-if="course.instructor">
              <img v-if="course.instructor.avatar" :src="getVideoUrl(course.instructor.avatar)" class="avatar-mini" />
              <div v-else class="avatar-fallback"><i class="bi bi-person-fill"></i></div>
              <div class="instructor-details">
                <RouterLink :to="`/profile/${course.instructor.username}`">{{ course.instructor.username }}</RouterLink>
                <span>Eğitmen</span>
              </div>
            </div>
            <div class="course-stats">
              <div class="stat rating-stars">
                <div class="stars">
                  <i v-for="i in 5" :key="i" class="bi" :class="i <= Math.round(course.averageRating) ? 'bi-star-fill' : 'bi-star'"></i>
                </div>
                <span>{{ course.averageRating.toFixed(1) }}</span>
              </div>
              <div class="stat"><i class="bi bi-collection-play"></i> {{ course.lessons?.length || 0 }} Ders</div>
            </div>
          </div>

          <hr class="divider" />

          <div class="content-body">
            <div class="tab-content mt-4">
              <p class="description">{{ currentLesson()?.description || course.description }}</p>
              
              <div v-if="parsedTimestamps.length > 0" class="timestamps-section mt-4">
                <h4><i class="bi bi-clock-history"></i> Bölümler</h4>
                <div class="timestamp-list">
                  <button 
                    v-for="ts in parsedTimestamps" 
                    :key="ts.time" 
                    @click="seekVideo(ts.time)"
                    class="timestamp-btn"
                  >
                    <span class="ts-time">{{ ts.display }}</span>
                    <span class="ts-label">{{ ts.label }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="reviews-section glass mt-4">
          <h3><i class="bi bi-chat-text-fill"></i> Değerlendirmeler</h3>
          
          <div v-if="authStore.isLoggedIn" class="add-review-form">
            <h4>Değerlendirme Yap</h4>
            <div class="rating-select">
              <i v-for="i in 5" :key="i" class="bi" :class="i <= newReview.rating ? 'bi-star-fill' : 'bi-star'" @click="newReview.rating = i"></i>
            </div>
            <textarea v-model="newReview.comment" placeholder="Yorumunuz..." rows="3"></textarea>
            <button @click="submitReview" :disabled="submittingReview">{{ submittingReview ? 'Gönderiliyor...' : 'Gönder' }}</button>
          </div>
          <div v-else class="add-review-form">
            <p>Değerlendirme yapmak için <RouterLink to="/login" style="color:var(--accent)">giriş yapın</RouterLink>.</p>
          </div>
          
          <div class="reviews-list mt-4">
            <div v-for="review in currentReviews" :key="review.id" class="review-item">
              <div class="review-header">
                <strong><i class="bi bi-person-circle"></i> {{ review.user?.username || 'Kullanıcı' }}</strong>
                <span class="stars"><i v-for="i in 5" :key="i" class="bi" :class="i <= review.rating ? 'bi-star-fill' : 'bi-star'"></i></span>
              </div>
              <p>{{ review.comment }}</p>
            </div>
            <p v-if="!currentReviews.length">Henüz değerlendirme yok. İlk yapan siz olun!</p>
          </div>
        </div>
      </div>

      <!-- Sidebar (Right) -->
      <aside class="playlist-sidebar glass">
        <div class="playlist-header">
          <h3>Kurs İçeriği</h3>
          <div class="progress-info" v-if="course.lessons?.length">
            <span>{{ course.lessons.length }} Video</span>
          </div>
        </div>
        <div class="playlist-items">
          <div 
            v-for="(lesson, index) in course.lessons" 
            :key="lesson.id || lesson._id"
            class="playlist-item"
            :class="{ active: index === currentLessonIndex }"
            @click="selectLesson(index)"
          >
            <div class="item-index">{{ index + 1 }}</div>
            <div class="item-thumb" :style="{ backgroundImage: `url(${lesson.thumbnail ? getVideoUrl(lesson.thumbnail) : '/placeholder-course.jpg'})` }">
              <div class="play-overlay"><i class="bi bi-play-fill"></i></div>
            </div>
            <div class="item-details">
              <span class="item-title">{{ lesson.title }}</span>
              <span class="item-duration" v-if="lesson.duration"><i class="bi bi-clock"></i> {{ lesson.duration }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="delete-modal glass">
          <div class="modal-header-danger">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <h3>Kursu Silmek Üzeresiniz</h3>
          </div>
          
          <div class="modal-body">
            <p class="warning-text">Bu işlem <strong>geri alınamaz</strong>. Kursa ait tüm dersler, öğrenci ilerlemeleri ve yorumlar kalıcı olarak silinecektir.</p>
            
            <div class="confirmation-form">
              <label class="checkbox-container">
                <input type="checkbox" v-model="deleteConfirmation.checkbox">
                <span class="checkmark"></span>
                Kursu tamamen silmek istediğimden eminim.
              </label>

              <div class="input-group">
                <label>Kullanıcı adınızı yazın:</label>
                <input type="text" v-model="deleteConfirmation.username" :placeholder="authStore.user?.username">
              </div>

              <div class="input-group">
                <label>Kursun tam adını yazın:</label>
                <input type="text" v-model="deleteConfirmation.courseTitle" :placeholder="course.title">
              </div>
            </div>

            <div class="modal-actions">
              <button @click="showDeleteModal = false" class="btn-cancel">İptal</button>
              <button 
                @click="handleDeleteCourse" 
                class="btn-delete-final" 
                :disabled="!canDelete || deleteLoading"
              >
                {{ deleteLoading ? 'Siliniyor...' : 'Kursu Kalıcı Olarak Sil' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <div v-else-if="loading" class="loading-full">
    <div class="spinner-xl"></div>
    <p>Kurs içeriği hazırlanıyor...</p>
  </div>

  <div v-else class="error-full">
    <i class="bi bi-exclamation-octagon"></i>
    <h2>Hay aksi!</h2>
    <p>{{ error || 'Kurs detaylarına ulaşılamadı.' }}</p>
    <RouterLink to="/courses" class="btn-back">Kurslara Dön</RouterLink>
  </div>
</template>

<style scoped>
.course-detail-page {
  padding: 2rem 0;
  background: var(--bg-primary);
}

.course-detail-container {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  max-width: 1600px;
}

@media (max-width: 1200px) {
  .course-detail-container {
    grid-template-columns: 1fr;
  }
}

.glass {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
}

/* Player Section */
.video-wrapper {
  background: #000;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player {
  width: 100%;
  height: 100%;
  outline: none;
}

.overview-placeholder {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.overview-placeholder .overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  padding: 2rem;
}

.overview-placeholder i {
  font-size: 5rem;
  color: var(--accent);
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

/* Info Card */
.info-card {
  padding: 2rem;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.donation-btn {
  background: #000;
  color: var(--pink);
  border: 2px solid var(--pink);
  padding: 0.6rem 1.5rem;
  border-radius: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
}

.donation-btn:hover {
  background: var(--pink);
  color: #000;
  border-color: #000;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(211, 134, 155, 0.3);
}

.delete-trigger-btn {
  background: rgba(204, 36, 29, 0.1);
  color: #cc241d;
  border: 1px solid rgba(204, 36, 29, 0.2);
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-trigger-btn:hover {
  background: #cc241d;
  color: #fff;
  transform: scale(1.05);
}

/* Playlist Scrollbar Improvement */
.playlist-items::-webkit-scrollbar {
  width: 6px;
}
.playlist-items::-webkit-scrollbar-track {
  background: transparent;
}
.playlist-items::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}
.playlist-items::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}

.lesson-count-badge {
  background: var(--accent);
  color: #000;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.lesson-count-badge.overview {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.info-header h2 {
  font-size: 1.8rem;
  color: var(--text-primary);
  font-weight: 800;
}

.instructor-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-mini, .avatar-fallback {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
}

.avatar-fallback {
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.instructor-details {
  display: flex;
  flex-direction: column;
}

.instructor-details a {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.1rem;
}

.instructor-details span {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.course-stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.rating-stars {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
}

.stars {
  color: var(--accent);
  display: flex;
  gap: 2px;
}

.stat i {
  color: var(--accent);
}

.divider {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid var(--border-color);
}

.description {
  line-height: 1.8;
  color: var(--text-secondary);
  font-size: 1.05rem;
}

/* Timestamps */
.timestamps-section h4 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timestamp-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timestamp-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: fit-content;
  min-width: 250px;
}

.timestamp-btn:hover {
  background: rgba(215, 153, 33, 0.1);
  border-color: var(--accent);
}

.ts-time {
  color: var(--accent);
  font-weight: 800;
  font-family: monospace;
  font-size: 1rem;
}

.ts-label {
  color: var(--text-primary);
  font-weight: 600;
}

/* Reviews */
.reviews-section {
  padding: 2rem;
}
.reviews-section h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}
.add-review-form {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
}
.rating-select {
  font-size: 1.5rem;
  color: var(--accent);
  cursor: pointer;
  margin-bottom: 1rem;
}
.add-review-form textarea {
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  margin-bottom: 1rem;
  resize: vertical;
}
.add-review-form button {
  background: var(--accent);
  color: #000;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
.review-item {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}
.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

/* Playlist Sidebar */
.playlist-sidebar {
  height: fit-content;
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 2rem;
}

.playlist-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.playlist-header h3 {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.progress-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.playlist-items {
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.playlist-item:hover {
  background: var(--bg-secondary);
}

.playlist-item.active {
  background: rgba(215, 153, 33, 0.1);
  border-color: var(--accent);
}

.item-index {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-secondary);
  width: 20px;
}

.item-thumb {
  width: 100px;
  aspect-ratio: 16/9;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
  flex-shrink: 0;
}

.play-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  color: #fff; opacity: 0; transition: opacity 0.2s;
  border-radius: 8px;
}

.playlist-item:hover .play-overlay,
.playlist-item.active .play-overlay {
  opacity: 1;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

.item-title {
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.item-duration {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.delete-modal {
  width: 100%;
  max-width: 500px;
  padding: 0;
  border-top: 5px solid #cc241d;
}

.modal-header-danger {
  padding: 2rem;
  background: rgba(204, 36, 29, 0.05);
  text-align: center;
}

.modal-header-danger i {
  font-size: 3rem;
  color: #cc241d;
  margin-bottom: 1rem;
}

.modal-header-danger h3 {
  font-size: 1.5rem;
  font-weight: 800;
}

.modal-body {
  padding: 2rem;
}

.warning-text {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.confirmation-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-weight: 700;
  color: #cc241d;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.input-group input {
  padding: 0.8rem 1rem;
  border-radius: 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel {
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 700;
  cursor: pointer;
}

.btn-delete-final {
  flex: 2;
  padding: 1rem;
  border-radius: 12px;
  background: #cc241d;
  border: none;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.btn-delete-final:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Full States */
.loading-full, .error-full {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.spinner-xl {
  width: 80px; height: 80px;
  border: 6px solid var(--bg-card);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-full i { font-size: 5rem; color: #cc241d; }
.btn-back {
  background: var(--accent);
  color: #000;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 800;
  text-decoration: none;
}
</style>
