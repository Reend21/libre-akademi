<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CATEGORY_STRUCTURE, POPULAR_CATEGORIES } from '../constants/categories'

const route = useRoute()
const router = useRouter()

const courses = ref([])
const loading = ref(true)
const searchQuery = ref(route.query.q || '')
const selectedCategory = ref(route.query.category || '')
const openCategories = ref([])

const toggleAccordion = (name) => {
  if (openCategories.value.includes(name)) {
    openCategories.value = openCategories.value.filter(n => n !== name)
  } else {
    openCategories.value.push(name)
  }
}

const fetchCourses = async () => {
  loading.value = true
  try {
    let url = 'http://localhost:5000/api/courses'
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (selectedCategory.value) params.append('category', selectedCategory.value)
    
    if (params.toString()) url += `?${params.toString()}`
    
    const res = await fetch(url)
    courses.value = await res.json()
  } catch (error) {
    console.error('Kurslar yüklenirken hata:', error)
  } finally {
    loading.value = false
  }
}

const updateFilters = (key, value) => {
  const query = { ...route.query }
  if (value) {
    query[key] = value
  } else {
    delete query[key]
  }
  router.push({ query })
}

const toggleCategory = (cat) => {
  const newValue = selectedCategory.value === cat ? '' : cat
  selectedCategory.value = newValue
  updateFilters('category', newValue)
}

const getCategoryIcon = (catName) => {
  for (const main of CATEGORY_STRUCTURE) {
    const found = main.subcategories.find(s => s.name === catName)
    if (found) return found.icon
  }
  return 'bi bi-tag'
}

watch(() => route.query, (newQuery) => {
  searchQuery.value = newQuery.q || ''
  selectedCategory.value = newQuery.category || ''
  fetchCourses()
}, { deep: true })

onMounted(() => {
  // Open the category group if a subcategory is selected
  CATEGORY_STRUCTURE.forEach(main => {
    if (main.subcategories.some(sub => sub.name === selectedCategory.value)) {
      openCategories.value.push(main.name)
    }
  })
  fetchCourses()
})
</script>

<template>
  <div class="explore-page-wrapper">
    <div class="explore-container">
      <!-- Left Sidebar -->
      <aside class="sidebar filters-sidebar glass">
        <!-- Popular Categories moved to TOP of Sidebar -->
        <div class="sidebar-section popular-section">
          <h3><i class="bi bi-fire" style="color: #cc241d;"></i> Popüler</h3>
          <div class="popular-grid">
            <button 
              v-for="pop in POPULAR_CATEGORIES.slice(0, 3)" 
              :key="pop.name"
              class="pop-card"
              :style="{ backgroundColor: pop.color + '15', color: pop.color, borderColor: pop.color + '44' }"
              @click="toggleCategory(pop.name)"
            >
              <i :class="getCategoryIcon(pop.name)"></i>
              <span>{{ pop.name }}</span>
            </button>
          </div>
        </div>

        <!-- Collapsible Categories -->
        <div class="sidebar-section categories-section">
          <h3><i class="bi bi-grid-fill"></i> Kategoriler</h3>
          <div class="accordion-menu">
            <div 
              v-for="mainCat in CATEGORY_STRUCTURE" 
              :key="mainCat.name" 
              class="accordion-item"
              :class="{ 'is-open': openCategories.includes(mainCat.name) }"
            >
              <div class="accordion-header" @click="toggleAccordion(mainCat.name)">
                <div class="header-left">
                  <i :class="mainCat.icon"></i>
                  <span>{{ mainCat.name }}</span>
                </div>
                <i class="bi bi-chevron-down chevron"></i>
              </div>
              
              <ul v-if="openCategories.includes(mainCat.name)" class="sub-cat-list">
                  <li 
                    v-for="sub in mainCat.subcategories" 
                    :key="sub.name"
                    :class="{ active: selectedCategory === sub.name }"
                    @click="toggleCategory(sub.name)"
                  >
                    <i :class="sub.icon" class="sub-icon"></i>
                    <span>{{ sub.name }}</span>
                  </li>
                </ul>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="content-header">
          <div class="header-info">
            <h1>Kursları Keşfet</h1>
            <p v-if="selectedCategory" class="filter-indicator">
              <i class="bi bi-tag-fill"></i> {{ selectedCategory }}
              <button @click="toggleCategory(selectedCategory)" class="close-tag">&times;</button>
            </p>
            <p v-else>En yeni ve popüler kurslarımızı inceleyin.</p>
          </div>
        </header>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Kurslar listeleniyor...</p>
        </div>

        <div v-else-if="courses.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <i class="bi bi-emoji-frown"></i>
          </div>
          <h2>Tüh, bu kategoride bir kurs yok</h2>
          <p>Farklı bir kategori seçmeyi veya arama yapmayı deneyin.</p>
          <button @click="selectedCategory = ''; searchQuery = ''; updateFilters()" class="clear-btn">
            Tüm Kursları Gör
          </button>
        </div>

        <div v-else class="course-grid">
          <div v-for="course in courses" :key="course._id" class="course-card-premium">
            <div class="card-inner">
              <div class="course-image" :style="{ backgroundImage: `url(${course.coverImage || '/placeholder-course.jpg'})` }">
                <div class="category-tag">{{ course.category }}</div>
              </div>
              <div class="course-body">
                <h3>{{ course.title }}</h3>
                <div class="card-meta">
                  <div class="author">
                    <i class="bi bi-person-circle"></i>
                    <span>{{ course.instructor?.username }}</span>
                  </div>
                  <div class="rating">
                    <i class="bi bi-star-fill"></i>
                    <span>{{ course.averageRating.toFixed(1) }}</span>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="lesson-count">
                    <i class="bi bi-play-circle"></i>
                    <span>{{ course.lessons?.length || 0 }} Ders</span>
                  </div>
                  <RouterLink :to="`/courses/${course._id}`" class="enroll-btn"> İncele </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Full screen layout */
.explore-page-wrapper {
  background: var(--bg-primary);
  padding: 0 3rem;
}

.explore-container {
  max-width: 1600px;
  margin: 0 auto;
}

.explore-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: calc(100vh - 80px);
}

/* Sidebar Styles */
.sidebar {
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  position: sticky;
  top: 0;
  height: calc(100vh - 80px);
  overflow-y: auto;
}

.sidebar-section h3 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.text-accent { color: var(--accent); }

/* Popular Grid */
.popular-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pop-card {
  padding: 0.8rem 1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.pop-card:hover {
  transform: translateX(8px);
  filter: brightness(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* Accordion Styles */
.accordion-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.accordion-item {
  border-radius: 12px;
  overflow: hidden;
  transition: background 0.2s;
}

.accordion-header {
  padding: 0.8rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: transparent;
  color: var(--text-primary);
  font-weight: 600;
  transition: all 0.2s;
}

.accordion-header:hover {
  background: var(--bg-secondary);
  color: var(--accent);
}

.is-open .accordion-header {
  background: var(--bg-secondary);
  color: var(--accent);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chevron {
  font-size: 0.8rem;
  transition: transform 0.3s;
}

.is-open .chevron {
  transform: rotate(180deg);
}

.sub-cat-list {
  background: var(--bg-secondary);
  list-style: none;
  padding: 0.5rem;
}

.sub-cat-list li {
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
}

.sub-cat-list li:hover {
  background: var(--bg-card);
  color: var(--accent);
  transform: translateX(4px);
}

.sub-cat-list li.active {
  background: var(--accent);
  color: #fff;
}

[data-theme="dark"] .sub-cat-list li.active {
  color: #282828;
}

/* Main Content */
.main-content {
  padding: 3rem;
  background: var(--bg-primary);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
}

.header-info h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.filter-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent);
  color: #fff;
  padding: 0.4rem 0.8rem;
  border-radius: 99px;
  font-weight: 700;
}

[data-theme="dark"] .filter-indicator { color: #282828; }

.close-tag {
  background: rgba(0,0,0,0.1);
  color: inherit;
  border: none;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.2rem;
}

/* Course Grid */
.course-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.course-card-premium {
  perspective: 1000px;
}

.card-inner {
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.course-card-premium:hover .card-inner {
  transform: translateY(-10px);
  box-shadow: 0 20px 30px -10px rgba(0,0,0,0.1);
  border-color: var(--accent);
}

.course-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.category-tag {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.9);
  color: #282828;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.course-body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-body h3 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.author, .rating {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.rating span {
  color: var(--accent);
  font-weight: 700;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.lesson-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.enroll-btn {
  background: var(--accent);
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 700;
  transition: transform 0.2s;
}

[data-theme="dark"] .enroll-btn { color: #282828; }

.enroll-btn:hover {
  transform: scale(1.05);
}

/* Transitions */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}
.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

/* Responsiveness */
@media (max-width: 1400px) {
  .course-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 1024px) {
  .explore-container { grid-template-columns: 1fr; }
  .sidebar { display: none; }
}

@media (max-width: 768px) {
  .course-grid { grid-template-columns: 1fr; }
  .content-header { flex-direction: column; align-items: flex-start; }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5rem 2rem;
  gap: 1.5rem;
}

.empty-icon-wrapper i {
  font-size: 5rem;
  color: var(--accent);
}

.empty-state h2 {
  font-size: 1.75rem;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.clear-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

[data-theme="dark"] .clear-btn { color: #282828; }
</style>
