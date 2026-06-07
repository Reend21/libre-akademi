<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usersApi } from '../api/users'
import { authApi } from '../api/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const success = ref('')

const activeTab = ref('personal') // 'personal', 'social', 'security', 'customization', 'courses'

const profileData = ref({
  name: '',
  username: '',
  bio: '',
  age: null,
  gender: 'prefer_not_to_say',
  phoneNumber: '',
  avatar: null,
  avatarPreview: '',
  isPrivate: false,
  theme: 'dark',
  preferredLanguage: 'tr'
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const securityData = ref({
  recoveryEmail: '',
  deletePassword: ''
})

const twoFactor = ref({
  setupActive: false,
  qrCodeUrl: '',
  secret: '',
  token: '',
  passwordToDisable: '',
  recoveryCodes: []
})

const coursesData = ref({
  published: [],
  completed: []
})

onMounted(async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }
  
  try {
    // Initial load from auth state / me endpoint provides latest user info
    const meData = await authApi.getMe(authStore.token)
    authStore.setUser(meData)

    profileData.value = {
      name: meData.name || '',
      username: meData.username || '',
      bio: meData.bio || '',
      age: meData.age || null,
      gender: meData.gender || 'prefer_not_to_say',
      phoneNumber: meData.phoneNumber || '',
      avatar: null,
      avatarPreview: meData.avatar || '',
      isPrivate: meData.isPrivate || false,
      theme: meData.theme || 'dark',
      preferredLanguage: meData.preferredLanguage || 'tr'
    }

    securityData.value.recoveryEmail = meData.recoveryEmail || ''

    // Fetch courses
    const published = await usersApi.getMyCourses(authStore.token)
    const completed = await usersApi.getMyCompletedCourses(authStore.token)
    
    coursesData.value.published = published
    coursesData.value.completed = completed
  } catch (err) {
    error.value = 'Bilgiler yüklenemedi.'
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
    if (profileData.value.avatar instanceof File) {
      payload = new FormData();
      payload.append('name', profileData.value.name);
      payload.append('username', profileData.value.username);
      payload.append('bio', profileData.value.bio);
      if (profileData.value.age) payload.append('age', profileData.value.age);
      payload.append('gender', profileData.value.gender);
      if (profileData.value.phoneNumber) payload.append('phoneNumber', profileData.value.phoneNumber);
      payload.append('isPrivate', profileData.value.isPrivate);
      payload.append('theme', profileData.value.theme);
      payload.append('preferredLanguage', profileData.value.preferredLanguage);
      if (profileData.value.avatar) payload.append('avatar', profileData.value.avatar);
    } else {
      payload = { ...profileData.value }
      delete payload.avatarPreview
      delete payload.avatar 
    }
    
    const updatedUser = await usersApi.updateProfile(authStore.token, payload)
    authStore.setUser({ ...authStore.user, ...updatedUser })
    success.value = 'Profil başarıyla güncellendi.'
    
    document.documentElement.dataset.theme = updatedUser.theme
    localStorage.setItem('theme', updatedUser.theme)
    
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

const handleRecoveryEmailUpdate = async () => {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    const res = await usersApi.updateRecoveryEmail(authStore.token, securityData.value.recoveryEmail)
    success.value = 'Kurtarma e-postası güncellendi.'
    authStore.setUser({ ...authStore.user, recoveryEmail: res.recoveryEmail })
  } catch (err) {
    error.value = err.message || 'Kurtarma e-postası güncellenemedi.'
  } finally {
    loading.value = false
  }
}

// 2FA Setup Flow
const begin2FASetup = async () => {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    const res = await authApi.setup2fa(authStore.token)
    twoFactor.value.qrCodeUrl = res.qrCodeUrl
    twoFactor.value.secret = res.secret
    twoFactor.value.setupActive = true
  } catch (err) {
    error.value = err.message || '2FA kurulumu başlatılamadı.'
  } finally {
    loading.value = false
  }
}

const verify2FASetup = async () => {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    const res = await authApi.verify2fa(authStore.token, twoFactor.value.token, twoFactor.value.secret)
    success.value = 'İki faktörlü doğrulama aktif edildi! Lütfen kurtarma kodlarınızı kaydedin.'
    twoFactor.value.setupActive = false
    twoFactor.value.recoveryCodes = res.recoveryCodes
    authStore.setUser({ ...authStore.user, twoFactorEnabled: true })
  } catch (err) {
    error.value = err.message || 'Geçersiz doğrulama kodu.'
  } finally {
    loading.value = false
  }
}

const disable2FA = async () => {
  error.value = ''
  success.value = ''
  if (!twoFactor.value.passwordToDisable) {
    error.value = 'Lütfen şifrenizi girin.'
    return
  }
  loading.value = true
  try {
    await authApi.disable2fa(authStore.token, twoFactor.value.passwordToDisable)
    success.value = 'İki faktörlü doğrulama devre dışı bırakıldı.'
    authStore.setUser({ ...authStore.user, twoFactorEnabled: false })
    twoFactor.value.passwordToDisable = ''
  } catch (err) {
    error.value = err.message || '2FA kapatılamadı. Şifrenizi kontrol edin.'
  } finally {
    loading.value = false
  }
}

const handleSocialConnect = (platform) => {
  if (platform === 'GitHub') {
    window.location.href = `http://localhost:5000/api/auth/connect/github?token=${authStore.token}`
  } else if (platform === 'Google') {
    window.location.href = `http://localhost:5000/api/auth/connect/google?token=${authStore.token}`
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleDeleteAccount = async () => {
  if (!confirm('Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return
  if (!securityData.value.deletePassword) {
    error.value = 'Hesabı silmek için şifrenizi girmelisiniz.'
    return
  }
  
  loading.value = true
  try {
    await usersApi.deleteAccount(authStore.token, securityData.value.deletePassword)
    authStore.logout()
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Hesap silinemedi. Şifrenizi kontrol edin.'
  } finally {
    loading.value = false
  }
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
            <i class="bi bi-shield-lock-fill"></i> Güvenlik ve Şifre
          </li>
          <li :class="{ active: activeTab === 'courses' }" @click="activeTab = 'courses'">
            <i class="bi bi-journal-bookmark-fill"></i> Kurslarım
          </li>
          <li :class="{ active: activeTab === 'customization' }" @click="activeTab = 'customization'">
            <i class="bi bi-palette-fill"></i> Özelleştirme
          </li>
        </ul>
      </aside>

      <!-- Main Content Area -->
      <main class="settings-content glass">
        
        <!-- Personal Info Tab -->
        <div v-show="activeTab === 'personal'" class="tab-pane modern-pane">
          <div class="pane-header">
            <h3>Kişisel Bilgiler</h3>
            <p class="tab-desc">Profilinizde görünecek temel bilgilerinizi buradan güncelleyebilirsiniz.</p>
          </div>
          
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
                  <span class="info-text">JPG veya PNG yükle (Maksimum 2MB)</span>
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
              <textarea v-model="profileData.bio" rows="4" placeholder="Kendinizden bahsedin..."></textarea>
            </div>

            <div class="input-row">
              <div class="input-group">
                <label>Yaş</label>
                <input type="number" v-model="profileData.age" min="1" max="120" class="no-spinners" />
              </div>
              <div class="input-group">
                <label>Cinsiyet</label>
                <select v-model="profileData.gender" class="form-select">
                  <option value="prefer_not_to_say">Belirtmek İstemiyorum</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
            </div>

            <div class="input-group">
              <label>Telefon Numarası</label>
              <input type="tel" v-model="profileData.phoneNumber" placeholder="+90 5XX XXX XX XX" />
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
        <div v-show="activeTab === 'social'" class="tab-pane modern-pane">
          <div class="pane-header">
            <h3>Sosyal Medya Bağlantıları</h3>
            <p class="tab-desc">Hesaplarınızı bağlayarak giriş işlemlerinizi hızlandırın.</p>
          </div>
          
          <div class="social-buttons-list">
            <button type="button" class="btn-social github" @click="handleSocialConnect('GitHub')">
              <div class="social-icon"><i class="bi bi-github"></i></div>
              <div class="social-text">
                <strong>GitHub</strong>
                <span>{{ authStore.user?.hasGithub ? 'Bağlantı Kuruldu' : 'Hesabını Bağla' }}</span>
              </div>
              <i v-if="authStore.user?.hasGithub" class="bi bi-check-circle-fill success-icon"></i>
              <i v-else class="bi bi-chevron-right arrow-icon"></i>
            </button>
            
            <button type="button" class="btn-social google" @click="handleSocialConnect('Google')">
              <div class="social-icon"><i class="bi bi-google"></i></div>
              <div class="social-text">
                <strong>Google</strong>
                <span>{{ authStore.user?.hasGoogle ? 'Bağlantı Kuruldu' : 'Hesabını Bağla' }}</span>
              </div>
              <i v-if="authStore.user?.hasGoogle" class="bi bi-check-circle-fill success-icon"></i>
              <i v-else class="bi bi-chevron-right arrow-icon"></i>
            </button>
          </div>
        </div>

        <!-- Security Tab -->
        <div v-show="activeTab === 'security'" class="tab-pane modern-pane">
          <div class="pane-header">
            <h3>Güvenlik ve Şifre</h3>
            <p class="tab-desc">Hesabınızı korumak için gerekli tüm güvenlik ayarları.</p>
          </div>
          
          <div class="security-section">
            <h4>Şifre Değiştir</h4>
            <form @submit.prevent="handlePasswordUpdate" class="edit-form security-form">
              <div class="input-group">
                <input type="password" v-model="passwordData.currentPassword" required placeholder="Mevcut Şifreniz" />
              </div>
              <div class="input-row">
                <div class="input-group">
                  <input type="password" v-model="passwordData.newPassword" required placeholder="Yeni Şifre" />
                </div>
                <div class="input-group">
                  <input type="password" v-model="passwordData.confirmPassword" required placeholder="Yeni Şifre (Tekrar)" />
                </div>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-outline" :disabled="loading">Şifreyi Değiştir</button>
              </div>
            </form>
          </div>

          <hr class="divider">

          <div class="security-section">
            <h4>Kurtarma E-postası</h4>
            <p class="info-text">Şifrenizi unutmanız durumunda alternatif bir iletişim kanalı.</p>
            <form @submit.prevent="handleRecoveryEmailUpdate" class="edit-form">
              <div class="input-group">
                <input type="email" v-model="securityData.recoveryEmail" placeholder="Yedek E-posta Adresi" />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-outline" :disabled="loading">Güncelle</button>
              </div>
            </form>
          </div>

          <hr class="divider">

          <div class="security-section">
            <h4>İki Faktörlü Doğrulama (2FA)</h4>
            <div v-if="!authStore.user?.twoFactorEnabled" class="two-fa-box">
              <p>Hesabınızın güvenliğini artırmak için Google Authenticator gibi bir uygulama ile 2FA kurun.</p>
              
              <div v-if="!twoFactor.setupActive">
                <button type="button" @click="begin2FASetup" class="btn btn-primary mt-2">2FA Kurulumunu Başlat</button>
              </div>
              <div v-else class="two-fa-setup-area">
                <img :src="twoFactor.qrCodeUrl" alt="2FA QR Code" class="qr-code" />
                <p>Uygulamanız ile yukarıdaki QR kodu taratın ve ürettiği 6 haneli kodu girin:</p>
                <div class="input-group mt-2">
                  <input type="text" v-model="twoFactor.token" placeholder="000000" maxlength="6" style="letter-spacing: 5px; text-align: center; font-size: 1.5rem;" />
                </div>
                <div class="form-actions mt-3">
                  <button type="button" class="btn btn-outline" @click="twoFactor.setupActive = false">İptal</button>
                  <button type="button" class="btn btn-primary" @click="verify2FASetup" :disabled="twoFactor.token.length !== 6">Doğrula ve Aktifleştir</button>
                </div>
              </div>
            </div>

            <div v-else class="two-fa-box active-box">
              <div class="active-badge"><i class="bi bi-shield-check"></i> 2FA Aktif</div>
              <p>İki faktörlü doğrulama hesabınızda etkin. Devre dışı bırakmak için mevcut şifrenizi girin.</p>
              
              <div v-if="twoFactor.recoveryCodes.length > 0" class="recovery-codes-box mt-3 mb-3">
                <h5>Kurtarma Kodlarınız</h5>
                <p class="warning-text">Lütfen bu kodları güvenli bir yere kaydedin. Bir daha gösterilmeyecektir!</p>
                <div class="codes-grid">
                  <span v-for="(code, i) in twoFactor.recoveryCodes" :key="i" class="code-item">{{ code }}</span>
                </div>
              </div>

              <div class="input-group mt-3">
                <input type="password" v-model="twoFactor.passwordToDisable" placeholder="Mevcut Şifreniz" />
              </div>
              <button type="button" @click="disable2FA" class="btn btn-danger mt-3" :disabled="loading">2FA Kapat</button>
            </div>
          </div>

          <hr class="divider">

          <div class="security-section danger-zone">
            <h4>Tehlikeli Bölge</h4>
            <div class="danger-actions">
              <button @click="handleLogout" class="btn btn-warning"><i class="bi bi-box-arrow-right"></i> Oturumu Kapat</button>
              
              <div class="delete-account-area mt-4">
                <p>Hesabınızı tamamen silmek istiyorsanız aşağıdaki alana şifrenizi girerek onaylayın.</p>
                <div class="input-group mt-2 mb-2">
                  <input type="password" v-model="securityData.deletePassword" placeholder="Şifreniz" />
                </div>
                <button @click="handleDeleteAccount" class="btn btn-danger"><i class="bi bi-trash"></i> Hesabımı Sil</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Courses Tab -->
        <div v-show="activeTab === 'courses'" class="tab-pane modern-pane">
          <div class="pane-header">
            <h3>Kurslarım</h3>
            <p class="tab-desc">Yayınladığınız ve tamamladığınız kursların özeti.</p>
          </div>
          
          <div class="courses-section">
            <h4>Yayınladığım Kurslar ({{ coursesData.published.length }})</h4>
            <div v-if="coursesData.published.length === 0" class="empty-state">
              <p>Henüz bir kurs yayınlamadınız.</p>
            </div>
            <div v-else class="courses-list">
              <div v-for="course in coursesData.published" :key="course._id" class="course-list-item glass">
                <img :src="course.thumbnail || '/placeholder.jpg'" alt="Course Thumbnail" class="course-thumb" />
                <div class="course-info">
                  <h5>{{ course.title }}</h5>
                  <RouterLink :to="`/courses/${course._id}`" class="btn btn-outline btn-sm mt-2">Görüntüle</RouterLink>
                </div>
              </div>
            </div>
          </div>

          <div class="courses-section mt-5">
            <h4>Tamamladığım Kurslar ({{ coursesData.completed.length }})</h4>
            <div v-if="coursesData.completed.length === 0" class="empty-state">
              <p>Henüz tamamladığınız bir kurs yok.</p>
            </div>
            <div v-else class="courses-list">
              <div v-for="course in coursesData.completed" :key="course._id" class="course-list-item glass">
                <img :src="course.thumbnail || '/placeholder.jpg'" alt="Course Thumbnail" class="course-thumb" />
                <div class="course-info">
                  <h5>{{ course.title }}</h5>
                  <RouterLink :to="`/courses/${course._id}`" class="btn btn-primary btn-sm mt-2">Sertifika / Görüntüle</RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Customization Tab -->
        <div v-show="activeTab === 'customization'" class="tab-pane modern-pane">
          <div class="pane-header">
            <h3>Özelleştirme ve Ayarlar</h3>
            <p class="tab-desc">Hesabınızın gizliliğini ve tema/dil ayarlarını buradan yönetin.</p>
          </div>
          
          <form @submit.prevent="handleProfileUpdate" class="edit-form">
            <div class="input-group">
              <label style="display:flex; align-items:center; gap:0.5rem; font-size:1.1rem; cursor:pointer;">
                <input type="checkbox" v-model="profileData.isPrivate" style="width:20px; height:20px;" />
                Profili Gizli Tut
              </label>
              <small class="info-text">Profiliniz gizli olduğunda diğer kullanıcılar etkinliklerinizi göremez.</small>
            </div>
            
            <div class="input-row mt-4">
              <div class="input-group">
                <label>Tema</label>
                <select v-model="profileData.theme" class="form-select">
                  <option value="dark">Koyu Tema</option>
                  <option value="light">Açık Tema</option>
                </select>
              </div>
              <div class="input-group">
                <label>Dil</label>
                <select v-model="profileData.preferredLanguage" class="form-select">
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                  <option value="az">Azerbeycanca</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                Değişiklikleri Kaydet
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

.modern-pane {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.pane-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.pane-header h3 {
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tab-desc {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
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
  font-size: 0.85rem;
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

.no-spinners::-webkit-outer-spin-button,
.no-spinners::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinners[type=number] {
  -moz-appearance: textfield;
}

.form-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Social Buttons */
.social-buttons-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
}

.btn-social {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
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

.success-icon {
  color: #10b981;
  font-size: 1.5rem;
}

.arrow-icon {
  color: var(--text-secondary);
  font-size: 1.2rem;
}

/* Security Section */
.security-section {
  margin-bottom: 2rem;
}

.security-section h4 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.divider {
  border: 0;
  height: 1px;
  background: var(--border-color);
  margin: 2.5rem 0;
}

.two-fa-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.active-box {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.2);
}

.active-badge {
  display: inline-block;
  background: #10b981;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.two-fa-setup-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: 12px;
  margin-top: 1.5rem;
}

.qr-code {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.recovery-codes-box {
  background: #1e1e1e;
  border: 1px solid #333;
  padding: 1.5rem;
  border-radius: 8px;
}

.warning-text {
  color: #fbbf24;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.codes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.code-item {
  font-family: monospace;
  font-size: 1.1rem;
  background: #000;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
  color: #10b981;
  letter-spacing: 2px;
}

/* Danger Zone */
.danger-zone {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 2rem;
  border-radius: 12px;
}

.danger-zone h4 {
  color: #ef4444;
}

/* Courses Tab */
.courses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-list-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
}

.course-thumb {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.course-info h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  background: var(--bg-primary);
  border-radius: 12px;
  color: var(--text-secondary);
}

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
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.alert.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.mt-5 { margin-top: 2rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
</style>
