<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { coursesApi } from '../api/courses'
import { API_BASE } from '../api/client'

const route = useRoute()
const course = ref(null)
const loading = ref(true)
const error = ref('')
const currentLessonIndex = ref(0)

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
  if (!course.value?.lessons?.length) return null
  return course.value.lessons[currentLessonIndex.value]
}

const getVideoUrl = (url) => {
  if (!url) return ''
  return url.startsWith('/') ? `${API_BASE}${url}` : url
}

const selectLesson = (index) => {
  currentLessonIndex.value = index
}
</script>

<template>
  <div class="course-detail-view" v-if="!loading && course">
    <div class="video-container mb-4">
      <video v-if="currentLesson()" controls class="video-player" :key="currentLessonIndex" :src="getVideoUrl(currentLesson().videoUrl)">
        Tarayıcınız video etiketini desteklemiyor.
      </video>
      <div v-else class="video-placeholder">
        <i class="bi bi-play-circle"></i>
        <p>Bu kurs için henüz video yüklenmemiş.</p>
      </div>
    </div>
    
    <div class="course-info">
      <h1>{{ course.title }}</h1>
      <p class="instructor" v-if="course.instructor">
        Eğitmen: <strong>
          <RouterLink :to="`/profile/${course.instructor.username}`">{{ course.instructor.username }}</RouterLink>
        </strong>
      </p>
      <div class="rating mb-4" v-if="course.averageRating">
        <span>⭐ {{ course.averageRating.toFixed(1) }}</span>
      </div>
      
      <div class="description mb-8">
        <h3>Kurs Hakkında</h3>
        <p>{{ course.description }}</p>
      </div>
      
      <div class="lessons mb-8" v-if="course.lessons && course.lessons.length">
        <h3>Ders İçeriği ({{ course.lessons.length }} Ders)</h3>
        <ul class="lesson-list">
          <li 
            v-for="(lesson, index) in course.lessons" 
            :key="lesson.id || lesson._id"
            class="lesson-item"
            :class="{ active: index === currentLessonIndex }"
            @click="selectLesson(index)"
          >
            <span>{{ index === currentLessonIndex ? '▶' : (index + 1) + '.' }} {{ lesson.title }}</span>
            <span v-if="lesson.duration">{{ lesson.duration }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="loading-state">
    <div class="spinner-large"></div>
    <p>Kurs yükleniyor...</p>
  </div>

  <div v-else class="error-state">
    <i class="bi bi-exclamation-triangle"></i>
    <p>{{ error || 'Kurs bulunamadı.' }}</p>
    <RouterLink to="/courses" class="btn mt-4">Kurslara Dön</RouterLink>
  </div>
</template>

<style scoped>
.course-detail-view { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }

.video-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}
.video-player { width: 100%; aspect-ratio: 16/9; background: #000; }
.video-placeholder {
  aspect-ratio: 16/9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  gap: 1rem;
}
.video-placeholder i { font-size: 4rem; color: var(--accent); }

.course-info h1 { color: var(--text-primary); margin-bottom: 0.5rem; }
.instructor { color: var(--text-secondary); margin-bottom: 1rem; }
.instructor a { color: var(--accent); }
.rating { display: flex; align-items: center; gap: 1rem; color: var(--accent); font-weight: bold; }

h3 { color: var(--text-primary); margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
.description p { color: var(--text-secondary); line-height: 1.6; }

.lesson-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; padding: 0; }
.lesson-item {
  display: flex; justify-content: space-between; padding: 1rem;
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 8px; cursor: pointer; transition: all 0.2s;
  color: var(--text-primary);
}
.lesson-item:hover { background: var(--bg-secondary); border-color: var(--accent); }
.lesson-item.active { border-left: 4px solid var(--accent); color: var(--accent); font-weight: bold; }

.loading-state, .error-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 50vh; gap: 1rem; color: var(--text-secondary);
}
.error-state i { font-size: 3rem; color: var(--accent); }
.spinner-large {
  width: 60px; height: 60px;
  border: 4px solid var(--bg-card); border-top-color: var(--accent);
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
