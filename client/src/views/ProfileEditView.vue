<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usersApi } from '../api/users'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const success = ref('')

const activeTab = ref('personal') // 'personal', 'social', 'security'

const profileData = ref({
  name: '',
  username: '',
  bio: '',
  age: null,
  gender: 'Belirtmek İstemiyorum',
  phoneNumber: '',
  avatar: null,
  avatarPreview: ''
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }
  
  try {
    const data = await usersApi.getUserProfile(authStore.user.username)
    profileData.value = {
      name: data.name || '',
      username: data.username || '',
      bio: data.bio || '',
      age: data.age || null,
      gender: data.gender || 'Belirtmek İstemiyorum',
      phoneNumber: data.phoneNumber || '',
      avatar: null,
      avatarPreview: data.avatar || ''
    }
  } catch (err) {
    error.value = 'Profil bilgileri yüklenemedi.'
  }
})

const handleAvatarChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    profileData.value.avatar = file
    const reader = new FileReader()
    reader.onload = (e) => {
      profileData.value.avatarPreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleProfileUpdate = async () => {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    let payload;
    
    // If a new avatar file is selected, we MUST use FormData
    if (profileData.value.avatar instanceof File) {
      payload = new FormData();
      payload.append('name', profileData.value.name);
      payload.append('username', profileData.value.username);
      payload.append('bio', profileData.value.bio);
      if (profileData.value.age) payload.append('age', profileData.value.age);
      payload.append('gender', profileData.value.gender);
      if (profileData.value.phoneNumber) payload.append('phoneNumber', profileData.value.phoneNumber);
      payload.append('avatar', profileData.value.avatar);
    } else {
      payload = { ...profileData.value }
      delete payload.avatarPreview
      delete payload.avatar 
    }
    
    const updatedUser = await usersApi.updateProfile(authStore.token, payload)
    authStore.setUser({ ...authStore.user, ...updatedUser })
    success.value = 'Profil başarıyla güncellendi.'
    
    if (authStore.user.username !== updatedUser.username) {
      router.push(`/profile/${updatedUser.username}`)
    }
  } catch (err) {
    error.value = err.message || 'Profil güncellenemedi.'
  } finally {
    loading.value = false
  }
}

const handlePasswordUpdate = async () => {
  error.value = ''
  success.value = ''
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    error.value = 'Yeni şifreler eşleşmiyor.'
    return
  }
  
  loading.value = true
  try {
    await usersApi.updatePassword(authStore.token, {
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword
    })
    success.value = 'Şifreniz başarıyla güncellendi.'
    passwordData.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err) {
    error.value = err.message || 'Şifre güncellenemedi.'
  } finally {
    loading.value = false
  }
}

const handleSocialConnect = (platform) => {
  // Social connection placeholder
  alert(`${platform} hesabını bağlama işlemi henüz aktif değil.`);
}
</script>

<template>
  <div class="profile-settings-wrapper container">
    <div class="settings-header">
      <h2><i class="bi bi-gear-fill"></i> Hesap Ayarları</h2>
      <RouterLink :to="`/profile/${authStore.user?.username}`" class="btn btn-outline btn-sm">
        <i class="bi bi-arrow-left"></i> Profile Dön
      </RouterLink>
    </div>

    <div v-if="error" class="alert error"><i class="bi bi-exclamation-triangle"></i> {{ error }}</div>
    <div v-if="success" class="alert success"><i class="bi bi-check-circle"></i> {{ success }}</div>

    <div class="settings-layout">
      <!-- Sidebar -->
      <aside class="settings-sidebar glass">
        <ul class="sidebar-menu">
          <li :class="{ active: activeTab === 'personal' }" @click="activeTab = 'personal'">
            <i class="bi bi-person-lines-fill"></i> Kişisel Bilgiler
          </li>
          <li :class="{ active: activeTab === 'social' }" @click="activeTab = 'social'">
            <i class="bi bi-link-45deg"></i> Bağlantılar
          </li>
          <li :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'">
            <i class="bi bi-shield-lock-fill"></i> Güvenlik
          </li>
        </ul>
      </aside>

      <!-- Main Content Area -->
      <main class="settings-content glass">
        
        <!-- Personal Info Tab -->
        <div v-show="activeTab === 'personal'" class="tab-pane">
          <h3>Kişisel Bilgiler</h3>
          <p class="tab-desc">Profilinizde görünecek temel bilgilerinizi buradan güncelleyebilirsiniz.</p>
          
          <form @submit.prevent="handleProfileUpdate" class="edit-form">
            
            <div class="avatar-upload-group">
              <label>Profil Fotoğrafı</label>
              <div class="avatar-preview-area">
                <div class="avatar-preview">
                  <img v-if="profileData.avatarPreview" :src="profileData.avatarPreview" alt="Avatar" />
                  <i v-else class="bi bi-person"></i>
                </div>
                <div class="avatar-actions">
                  <label for="avatar-input" class="btn btn-outline btn-sm">
                    <i class="bi bi-camera-fill"></i> Fotoğraf Değiştir
                  </label>
                  <input id="avatar-input" type="file" accept="image/*" class="hidden-input" @change="handleAvatarChange" />
                  <span class="info-text">JPG, PNG, maks. 2MB</span>
                </div>
              </div>
            </div>

            <div class="input-row mt-4">
              <div class="input-group">
                <label>Ad Soyad</label>
                <input type="text" v-model="profileData.name" required />
              </div>
              <div class="input-group">
                <label>Kullanıcı Adı</label>
                <input type="text" v-model="profileData.username" required />
              </div>
            </div>

            <div class="input-group">
              <label>Hakkımda</label>
              <textarea v-model="profileData.bio" rows="4" placeholder="Kendinizden kısaca bahsedin..."></textarea>
            </div>

            <div class="input-row">
              <div class="input-group">
                <label>Yaş</label>
                <input type="number" v-model="profileData.age" min="1" max="120" class="no-spinners" placeholder="Örn: 25" />
              </div>
              <div class="input-group">
                <label>Cinsiyet</label>
                <select v-model="profileData.gender" class="form-select">
                  <option value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</option>
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                </select>
              </div>
            </div>

            <div class="input-group">
              <label>Telefon Numarası</label>
              <input type="tel" v-model="profileData.phoneNumber" placeholder="+90 555 555 5555" />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>

        <!-- Social Connections Tab -->
        <div v-show="activeTab === 'social'" class="tab-pane">
          <h3>Sosyal Medya Bağlantıları</h3>
          <p class="tab-desc">Diğer hesaplarınızı Libre Akademi'ye bağlayarak giriş işlemlerinizi hızlandırabilir veya profilinizde sergileyebilirsiniz.</p>
          
          <div class="social-buttons-list">
            <button type="button" class="btn-social github" @click="handleSocialConnect('GitHub')">
              <div class="social-icon"><i class="bi bi-github"></i></div>
              <div class="social-text">
                <strong>GitHub</strong>
                <span>Hesabını Bağla</span>
              </div>
              <i class="bi bi-chevron-right arrow-icon"></i>
            </button>
            
            <button type="button" class="btn-social google" @click="handleSocialConnect('Google')">
              <div class="social-icon"><i class="bi bi-google"></i></div>
              <div class="social-text">
                <strong>Google</strong>
                <span>Hesabını Bağla</span>
              </div>
              <i class="bi bi-chevron-right arrow-icon"></i>
            </button>
            
            <button type="button" class="btn-social linkedin" @click="handleSocialConnect('LinkedIn')">
              <div class="social-icon"><i class="bi bi-linkedin"></i></div>
              <div class="social-text">
                <strong>LinkedIn</strong>
                <span>Hesabını Bağla</span>
              </div>
              <i class="bi bi-chevron-right arrow-icon"></i>
            </button>
          </div>
        </div>

        <!-- Security Tab -->
        <div v-show="activeTab === 'security'" class="tab-pane">
          <h3>Güvenlik & Şifre</h3>
          <p class="tab-desc">Hesap şifrenizi güvenli bir şekilde güncelleyebilirsiniz.</p>
          
          <form @submit.prevent="handlePasswordUpdate" class="edit-form security-form">
            <div class="input-group">
              <label>Mevcut Şifre</label>
              <input type="password" v-model="passwordData.currentPassword" required placeholder="••••••••" />
            </div>
            
            <div class="input-row">
              <div class="input-group">
                <label>Yeni Şifre</label>
                <input type="password" v-model="passwordData.newPassword" required placeholder="••••••••" />
              </div>
              <div class="input-group">
                <label>Yeni Şifre (Tekrar)</label>
                <input type="password" v-model="passwordData.confirmPassword" required placeholder="••••••••" />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-outline" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                Şifreyi Değiştir
              </button>
            </div>
          </form>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
.profile-settings-wrapper {
  padding: 4rem 1rem;
  min-height: 80vh;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.settings-header h2 {
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 2rem;
}

.glass {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.settings-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 900px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
}

/* Sidebar Styles */
.settings-sidebar {
  padding: 1.5rem 1rem;
  position: sticky;
  top: 100px;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-menu li {
  padding: 1rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.sidebar-menu li i {
  font-size: 1.25rem;
}

.sidebar-menu li:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.sidebar-menu li.active {
  background: rgba(215, 153, 33, 0.1);
  color: var(--accent);
  border-left: 4px solid var(--accent);
}

/* Main Content Styles */
.settings-content {
  padding: 2.5rem;
  min-height: 500px;
}

.tab-pane h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tab-desc {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
}

/* Avatar Upload Styles */
.avatar-upload-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.avatar-upload-group label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.avatar-preview-area {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid var(--border-color);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 3rem;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hidden-input {
  display: none;
}

.info-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* Form Inputs */
.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.input-group input, .input-group select, .input-group textarea {
  padding: 0.85rem 1.2rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  transition: all 0.2s;
}

.input-group input:focus, .input-group select:focus, .input-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(215, 153, 33, 0.1);
}

/* Remove number input arrows (spinners) */
.no-spinners::-webkit-outer-spin-button,
.no-spinners::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinners[type=number] {
  -moz-appearance: textfield;
}

.form-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

/* Social Buttons */
.social-buttons-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
}

.btn-social {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  color: var(--text-primary);
}

.btn-social:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.social-icon {
  font-size: 2rem;
  margin-right: 1.5rem;
  width: 40px;
  display: flex;
  justify-content: center;
}

.social-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.social-text strong {
  font-size: 1.1rem;
  margin-bottom: 0.2rem;
}

.social-text span {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.arrow-icon {
  color: var(--text-secondary);
  font-size: 1.2rem;
}

/* Brand Colors on Hover */
.btn-social.github:hover { border-color: #333; }
.btn-social.google:hover { border-color: #ea4335; }
.btn-social.linkedin:hover { border-color: #0077b5; }
.btn-social.github:hover .social-icon i { color: #333; }
.btn-social.google:hover .social-icon i { color: #ea4335; }
.btn-social.linkedin:hover .social-icon i { color: #0077b5; }
[data-theme="dark"] .btn-social.github:hover { border-color: #fff; }
[data-theme="dark"] .btn-social.github:hover .social-icon i { color: #fff; }

.alert {
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
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
.mt-4 { margin-top: 1rem; }
</style>
