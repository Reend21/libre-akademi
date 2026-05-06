<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/auth'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const age = ref('')
const gender = ref('prefer_not_to_say')
const captchaInput = ref('')
const num1 = ref(0)
const num2 = ref(0)
const error = ref('')
const loading = ref(false)

const validationErrors = computed(() => {
  const errors = {}
  if (fullName.value && fullName.value.trim().split(' ').length < 2) errors.fullName = 'Lütfen ad ve soyad girin.'
  if (username.value && (username.value.length < 3 || /\s/.test(username.value))) errors.username = 'Kullanıcı adı en az 3 karakter olmalı ve boşluk içermemelidir.'
  if (email.value && !/^\S+@\S+\.\S+$/.test(email.value)) errors.email = 'Geçerli bir e-posta adresi girin.'
  if (password.value && password.value.length < 6) errors.password = 'Şifre en az 6 karakter olmalıdır.'
  if (passwordConfirm.value && password.value !== passwordConfirm.value) errors.passwordConfirm = 'Şifreler eşleşmiyor.'
  if (age.value && (age.value < 1 || age.value > 120)) errors.age = 'Geçerli bir yaş girin.'
  return errors
})

const generateCaptcha = () => {
  num1.value = Math.floor(Math.random() * 10) + 1
  num2.value = Math.floor(Math.random() * 10) + 1
}

onMounted(() => {
  generateCaptcha()
})

const handleRegister = async () => {
  error.value = ''
  if (parseInt(captchaInput.value) !== num1.value + num2.value) {
    error.value = 'Captcha hatalı, lütfen tekrar deneyin.'
    generateCaptcha()
    captchaInput.value = ''
    return
  }
  if (password.value !== passwordConfirm.value) {
    error.value = 'Şifreler eşleşmiyor.'
    return
  }
  
  loading.value = true
  try {
    const userData = await authApi.register({
      name: fullName.value,
      username: username.value,
      email: email.value,
      password: password.value,
      age: age.value ? parseInt(age.value) : null,
      gender: gender.value
    })
    authStore.login(userData)
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Kayıt yapılamadı.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-wrapper glass">
      <!-- Left side: Icons & Info -->
      <div class="auth-side-info">
        <div class="info-content">
          <div class="branding-group">
            <i class="bi bi-mortarboard-fill brand-icon"></i>
            <h1>Libre Akademi</h1>
            <p>Öğrenmenin en özgür yolu.</p>
          </div>
          <div class="icon-grid">
            <div class="icon-item">
              <i class="bi bi-shield-check"></i>
              <span>Güvenli Eğitim</span>
            </div>
            <div class="icon-item">
              <i class="bi bi-people-fill"></i>
              <span>Geniş Topluluk</span>
            </div>
            <div class="icon-item">
              <i class="bi bi-journal-code"></i>
              <span>Açık Kaynak</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Register Form -->
      <div class="auth-form-area">
        <div class="form-header">
          <h2>Kayıt Ol</h2>
          <p>Yeni bir hesap oluşturun ve aramıza katılın.</p>
        </div>
        
        <form @submit.prevent="handleRegister" class="auth-form">
          <div v-if="error" class="error-message">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ error }}
          </div>

          <div class="input-row">
            <div class="input-group">
              <label><i class="bi bi-person-fill"></i> Ad Soyad</label>
              <input type="text" v-model="fullName" :class="{ 'invalid': validationErrors.fullName }" required placeholder="Can Yılmaz" />
              <span v-if="validationErrors.fullName" class="field-error">{{ validationErrors.fullName }}</span>
            </div>
            <div class="input-group">
              <label><i class="bi bi-at"></i> Kullanıcı Adı</label>
              <input type="text" v-model="username" :class="{ 'invalid': validationErrors.username }" required placeholder="canyilmaz" />
              <span v-if="validationErrors.username" class="field-error">{{ validationErrors.username }}</span>
            </div>
          </div>

          <div class="input-group">
            <label><i class="bi bi-envelope-fill"></i> E-posta</label>
            <input type="email" v-model="email" :class="{ 'invalid': validationErrors.email }" required placeholder="can@akademi.org" />
            <span v-if="validationErrors.email" class="field-error">{{ validationErrors.email }}</span>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label><i class="bi bi-calendar3"></i> Yaş</label>
              <input type="number" v-model="age" :class="{ 'invalid': validationErrors.age }" placeholder="25" min="1" max="120" />
              <span v-if="validationErrors.age" class="field-error">{{ validationErrors.age }}</span>
            </div>
            <div class="input-group">
              <label><i class="bi bi-gender-ambiguous"></i> Cinsiyet</label>
              <select v-model="gender" class="form-select">
                <option value="prefer_not_to_say">Belirtmek İstemiyorum</option>
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
                <option value="other">Diğer</option>
              </select>
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label><i class="bi bi-lock-fill"></i> Şifre</label>
              <input type="password" v-model="password" :class="{ 'invalid': validationErrors.password }" required placeholder="••••••••" />
              <span v-if="validationErrors.password" class="field-error">{{ validationErrors.password }}</span>
            </div>
            <div class="input-group">
              <label><i class="bi bi-lock-fill"></i> Şifre (Tekrar)</label>
              <input type="password" v-model="passwordConfirm" :class="{ 'invalid': validationErrors.passwordConfirm }" required placeholder="••••••••" />
              <span v-if="validationErrors.passwordConfirm" class="field-error">{{ validationErrors.passwordConfirm }}</span>
            </div>
          </div>

          <div class="input-group captcha-group">
            <label><i class="bi bi-shield-lock-fill"></i> Doğrulama: {{ num1 }} + {{ num2 }} = ?</label>
            <input type="number" v-model="captchaInput" required placeholder="İşlem sonucunu yazınız" />
          </div>

          <button type="submit" class="submit-btn" :disabled="loading || Object.keys(validationErrors).length > 0">
            <i v-if="!loading" class="bi bi-person-plus-fill"></i>
            <span v-else class="spinner"></span>
            {{ loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol' }}
          </button>
        </form>

        <div class="form-footer">
          <p>Zaten hesabınız var mı? <RouterLink to="/login">E giriş yapın o zaman!</RouterLink></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem; /* Reduced horizontal padding (margin equivalent) */
}

.auth-wrapper {
  display: grid;
  grid-template-columns: 1fr 1.3fr; /* Slightly wider right side */
  width: 100%;
  max-width: 1350px; /* Made it significantly wider */
  min-height: 750px; /* Made it slightly taller */
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color);
}

.glass {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
}

.auth-side-info {
  background: linear-gradient(135deg, var(--accent) 0%, #b57614 100%);
  color: #fff;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .auth-side-info {
  background: linear-gradient(135deg, var(--accent) 0%, #d79921 100%);
  color: #282828;
}

.info-content {
  position: relative;
  z-index: 2;
}

.brand-icon {
  font-size: 5.5rem;
  margin-bottom: 1.5rem;
  display: block;
}

.branding-group h1 {
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
  font-family: 'Hermit', monospace;
}

.branding-group p {
  font-size: 1.3rem;
  opacity: 0.9;
  margin-bottom: 3.5rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 2rem;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease;
}

.icon-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.2);
}

.icon-item i {
  font-size: 2.5rem;
}

.icon-item span {
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}

.auth-form-area {
  padding: 5rem 6rem;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 2.5rem;
}

.form-header h2 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-header p {
  color: var(--text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-group input, .input-group select {
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: 'Hermit', monospace;
  transition: all 0.2s;
}

.input-group input:focus, .input-group select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(215, 153, 33, 0.1);
}

.input-group input.invalid, .input-group select.invalid {
  border-color: #fb4934;
}

.field-error {
  color: #fb4934;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 0.25rem;
}

.submit-btn {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--accent);
  color: #fff;
  transition: all 0.3s ease;
}

[data-theme="dark"] .submit-btn {
  color: #282828;
}

.submit-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: rgba(251, 73, 52, 0.1);
  color: #fb4934;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(251, 73, 52, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-footer {
  margin-top: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.form-footer a {
  font-weight: 700;
  color: var(--accent);
}

@media (max-width: 992px) {
  .auth-wrapper {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
  .auth-side-info {
    display: none;
  }
}
</style>
