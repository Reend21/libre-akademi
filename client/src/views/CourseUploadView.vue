<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { coursesApi } from '../api/courses'
import { CATEGORY_STRUCTURE } from '../constants/categories'

const router = useRouter()
const authStore = useAuthStore()

const categories = CATEGORY_STRUCTURE.map(c => c.name)

const loading = ref(false)
const error = ref('')
const success = ref('')

// Course Data
const course = ref({
  title: '',
  category: '',
  description: '',
  coverImage: null,
  coverImagePreview: ''
})

// Lessons Data
const lessons = ref([])
let lessonIdCounter = 0

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
  }
  // Add one empty lesson by default
  addLesson()
})

const addLesson = () => {
  lessons.value.push({
    id: lessonIdCounter++, // Unique ID for v-for key and drag-drop
    title: '',
    duration: '',
    description: '',
    video: null,
    thumbnail: null
  })
}

const removeLesson = (index) => {
  if (lessons.value.length > 1) {
    lessons.value.splice(index, 1)
  }
}

// Drag and Drop
const dragIndex = ref(-1)

const onDragStart = (index) => {
  dragIndex.value = index
}

const onDrop = (index) => {
  if (dragIndex.value === index || dragIndex.value === -1) return
  const draggedItem = lessons.value.splice(dragIndex.value, 1)[0]
  lessons.value.splice(index, 0, draggedItem)
  dragIndex.value = -1
}

// File handlers
const onCoverChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    course.value.coverImage = file
    course.value.coverImagePreview = URL.createObjectURL(file)
  }
}

const onVideoChange = (e, index) => {
  const file = e.target.files[0]
  if (file) {
    lessons.value[index].video = file
  }
}

const onLessonThumbnailChange = (e, index) => {
  const file = e.target.files[0]
  if (file) {
    lessons.value[index].thumbnail = file
  }
}

// Submit
const publishCourse = async () => {
  error.value = ''
  success.value = ''
  
  if (!course.value.title || !course.value.category || !course.value.description) {
    error.value = 'Lütfen tüm kurs bilgilerini doldurun.'
    return
  }

  // Validate lessons
  for (let i = 0; i < lessons.value.length; i++) {
    const l = lessons.value[i]
    if (!l.title || !l.video) {
      error.value = `${i + 1}. dersin başlığı ve videosu zorunludur.`
      return
    }
  }

  loading.value = true

  try {
    // 1. Create Course
    const courseFormData = new FormData()
    courseFormData.append('title', course.value.title)
    courseFormData.append('category', course.value.category)
    courseFormData.append('description', course.value.description)
    if (course.value.coverImage) {
      courseFormData.append('coverImage', course.value.coverImage)
    }

    const createdCourse = await coursesApi.createCourse(authStore.token, courseFormData)
    const courseId = createdCourse._id || createdCourse.id

    // 2. Upload Lessons Sequentially
    for (let i = 0; i < lessons.value.length; i++) {
      const lesson = lessons.value[i]
      const lessonFormData = new FormData()
      lessonFormData.append('title', lesson.title)
      lessonFormData.append('order', i) // Save the drag-drop order
      if (lesson.duration) lessonFormData.append('duration', lesson.duration)
      if (lesson.description) lessonFormData.append('description', lesson.description)
      if (lesson.video) lessonFormData.append('video', lesson.video)
      if (lesson.thumbnail) lessonFormData.append('thumbnail', lesson.thumbnail)

      await coursesApi.uploadLesson(authStore.token, courseId, lessonFormData)
    }

    success.value = 'Kurs başarıyla yayınlandı! Yönlendiriliyorsunuz...'
    setTimeout(() => {
      router.push(`/courses`)
    }, 2000)

  } catch (err) {
    error.value = err.message || 'Yükleme sırasında bir hata oluştu.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="upload-container container">
    <div class="upload-header">
      <h2><i class="bi bi-cloud-arrow-up-fill"></i> Yeni Kurs Yükle</h2>
      <p>Bilgilerinizi paylaşın ve yeni bir kurs oluşturun.</p>
    </div>

    <div class="upload-grid">
      <!-- Sol Taraf: Ders Listesi -->
      <div class="lessons-panel glass">
        <h3><i class="bi bi-collection-play-fill"></i> Dersler (Videolar)</h3>
        <p class="panel-desc">Sürükleyip bırakarak sıralamayı değiştirebilirsiniz.</p>
        
        <div class="lessons-list">
          <transition-group name="lesson-anim">
            <div 
              v-for="(lesson, index) in lessons" 
              :key="lesson.id" 
              class="lesson-card"
              draggable="true"
              @dragstart="onDragStart(index)"
              @dragover.prevent
              @drop="onDrop(index)"
            >
              <div class="drag-handle" title="Sürükle"><i class="bi bi-grip-vertical"></i></div>
              <div class="lesson-content">
                <div class="lesson-header">
                  <span class="lesson-number">{{ index + 1 }}</span>
                  <input type="text" v-model="lesson.title" placeholder="Ders Başlığı" class="lesson-title-input" />
                  <button type="button" @click="removeLesson(index)" class="btn-icon text-error" title="Dersi Sil">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <div class="lesson-details">
                  <div class="lesson-row">
                    <input type="text" v-model="lesson.duration" placeholder="Süre (Örn: 04:30)" class="lesson-input small-input" />
                    <textarea v-model="lesson.description" placeholder="Ders açıklaması..." class="lesson-input" rows="1"></textarea>
                  </div>
                  <div class="lesson-file-inputs">
                    <label class="file-btn" :class="{ 'has-file': lesson.video }">
                      <i class="bi bi-camera-video-fill"></i> <span class="truncate">{{ lesson.video ? lesson.video.name : 'Video Seç' }}</span>
                      <input type="file" accept="video/*" @change="e => onVideoChange(e, index)" hidden />
                    </label>
                    <label class="file-btn" :class="{ 'has-file': lesson.thumbnail }">
                      <i class="bi bi-image-fill"></i> <span class="truncate">{{ lesson.thumbnail ? lesson.thumbnail.name : 'Küçük Resim Seç' }}</span>
                      <input type="file" accept="image/*" @change="e => onLessonThumbnailChange(e, index)" hidden />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>

        <button type="button" class="btn-add-lesson" @click="addLesson">
          <i class="bi bi-plus-circle-fill"></i> Yeni Ders Ekle
        </button>
      </div>

      <!-- Sağ Taraf: Kurs Bilgileri -->
      <div class="course-panel glass">
        <h3><i class="bi bi-info-square-fill"></i> Kurs Bilgileri</h3>
        <p class="panel-desc">Kursunuzun vitrinini buradan oluşturun.</p>
        
        <form @submit.prevent="publishCourse" class="course-form">
          
          <div class="input-group">
            <label>Kurs Başlığı</label>
            <input type="text" v-model="course.title" placeholder="Örn: Sıfırdan İleri Seviye Vue.js Eğitimi" required />
          </div>

          <div class="input-group">
            <label>Kategori</label>
            <select v-model="course.category" required>
              <option value="">Kategori Seçin</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="input-group">
            <label>Kurs Kapak Fotoğrafı</label>
            <div class="cover-upload-area" :class="{ 'has-image': course.coverImagePreview }">
              <img v-if="course.coverImagePreview" :src="course.coverImagePreview" />
              <div v-else class="upload-placeholder">
                <i class="bi bi-cloud-arrow-up"></i>
                <span>Tıklayın veya sürükleyin</span>
              </div>
              <input type="file" accept="image/*" @change="onCoverChange" class="absolute-input" />
            </div>
          </div>

          <div class="input-group">
            <label>Kurs Açıklaması</label>
            <textarea v-model="course.description" rows="4" placeholder="Bu kurs öğrencilere ne katacak? Neler öğrenecekler?" required></textarea>
          </div>

          <div v-if="error" class="alert error"><i class="bi bi-exclamation-triangle"></i> {{ error }}</div>
          <div v-if="success" class="alert success"><i class="bi bi-check-circle"></i> {{ success }}</div>

          <button type="submit" class="btn-publish" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
            <i v-else class="bi bi-rocket-takeoff-fill"></i> 
            Kursu Yayınla
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-container {
  padding: 3rem 1rem;
  max-width: 1400px;
}

.upload-header {
  text-align: center;
  margin-bottom: 3rem;
}

.upload-header h2 {
  color: var(--accent);
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.upload-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.upload-grid {
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }
}

.glass {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.4rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.panel-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

/* Lessons Panel */
.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.lesson-card {
  display: flex;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.lesson-card:hover {
  border-color: var(--accent);
  box-shadow: 0 5px 15px rgba(215, 153, 33, 0.1);
}

.drag-handle {
  width: 40px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: grab;
  border-right: 1px solid var(--border-color);
}

.drag-handle:active {
  cursor: grabbing;
}

.lesson-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lesson-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lesson-number {
  background: var(--accent);
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

[data-theme="dark"] .lesson-number {
  color: var(--bg-primary);
}

.lesson-title-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--border-color);
  padding: 0.5rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
  font-weight: 600;
  outline: none;
  transition: border-color 0.2s;
}

.lesson-title-input:focus {
  border-bottom-color: var(--accent);
}

.btn-icon {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: rgba(251, 73, 52, 0.1);
}

.lesson-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lesson-row {
  display: flex;
  gap: 1rem;
}

.lesson-input {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  border-radius: 8px;
  color: var(--text-primary);
  font-family: inherit;
  flex: 1;
  resize: none;
}

.small-input {
  max-width: 150px;
}

.lesson-input:focus {
  outline: none;
  border-color: var(--accent);
}

.lesson-file-inputs {
  display: flex;
  gap: 1rem;
}

.file-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  overflow: hidden;
}

.file-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.file-btn.has-file {
  border-style: solid;
  border-color: var(--accent);
  background: rgba(215, 153, 33, 0.05);
  color: var(--text-primary);
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.btn-add-lesson {
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: 2px dashed var(--accent);
  color: var(--accent);
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-add-lesson:hover {
  background: var(--accent);
  color: #fff;
}

[data-theme="dark"] .btn-add-lesson:hover {
  color: var(--bg-primary);
}

/* Animations */
.lesson-anim-enter-active,
.lesson-anim-leave-active {
  transition: all 0.4s ease;
}
.lesson-anim-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}
.lesson-anim-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Course Panel */
.course-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.input-group input, 
.input-group select, 
.input-group textarea {
  padding: 0.85rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  transition: all 0.2s;
}

.input-group input:focus, 
.input-group select:focus, 
.input-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(215, 153, 33, 0.1);
}

.cover-upload-area {
  position: relative;
  height: 200px;
  border: 2px dashed var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-primary);
  transition: border-color 0.2s;
}

.cover-upload-area:hover {
  border-color: var(--accent);
}

.cover-upload-area.has-image {
  border-style: solid;
  border-color: var(--border-color);
}

.cover-upload-area img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  gap: 0.5rem;
}

.upload-placeholder i {
  font-size: 3rem;
  color: var(--accent);
}

.absolute-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.btn-publish {
  background: linear-gradient(135deg, var(--accent), #eab308);
  color: #000;
  border: none;
  padding: 1.2rem;
  font-size: 1.2rem;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(215, 153, 33, 0.4);
}

.btn-publish:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(215, 153, 33, 0.6);
}

.btn-publish:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
}

.alert.error {
  background: rgba(251, 73, 52, 0.1);
  color: #fb4934;
  border: 1px solid rgba(251, 73, 52, 0.2);
}

.alert.success {
  background: rgba(184, 187, 38, 0.1);
  color: #b8bb26;
  border: 1px solid rgba(184, 187, 38, 0.2);
}
</style>
