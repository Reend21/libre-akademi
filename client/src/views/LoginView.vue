<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/auth'

const router = useRouter()
const authStore = useAuthStore()

const identifier = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const requires2FA = ref(false)
const tempToken = ref('')
const twoFaCode = ref('')

const validationErrors = computed(() => {
  const errors = {}
  if (!requires2FA.value) {
    if (identifier.value && identifier.value.length < 3) errors.identifier = 'En az 3 karakter olmalıdır.'
    if (password.value && password.value.length < 6) errors.password = 'Şifre en az 6 karakter olmalıdır.'
  } else {
    if (twoFaCode.value && twoFaCode.value.length < 6) errors.twoFaCode = 'Kod en az 6 karakter olmalıdır.'
  }
  return errors
})

const handleLogin = async () => {
  error.value = ''
  if (Object.keys(validationErrors.value).length > 0) return

  loading.value = true
  try {
    const res = await authApi.login(identifier.value, password.value)
    
    if (res.requires2FA) {
      requires2FA.value = true
      tempToken.value = res.tempToken
    } else {
      authStore.login(res)
      router.push('/')
    }
  } catch (err) {
    error.value = err.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.'
  } finally {
    loading.value = false
  }
}

const handle2FALogin = async () => {
  error.value = ''
  if (Object.keys(validationErrors.value).length > 0) return

  loading.value = true
  try {
    const res = await authApi.login2fa(tempToken.value, twoFaCode.value)
    authStore.login(res)
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Geçersiz 2FA kodu.'
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
            <i class="bi bi-person-badge-fill brand-icon"></i>
            <h1>Esenlikler!</h1>
            <p>Kaldığınız yerden devam etmek için giriş yapın.</p>
          </div>
          <div class="icon-grid">
            <div class="icon-item">
              <i class="bi bi-clock-history"></i>
              <span>Geçmişini Gör</span>
            </div>
            <div class="icon-item">
              <i class="bi bi-stars"></i>
              <span>Özel İçerikler</span>
            </div>
            <div class="icon-item">
              <i class="bi bi-chat-heart-fill"></i>
              <span>Eğitmenle İletişim</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Login Form -->
      <div class="auth-form-area">
        <div class="form-header">
          <h2>{{ requires2FA ? 'İki Faktörlü Doğrulama' : 'Giriş Yap' }}</h2>
          <p>{{ requires2FA ? 'Lütfen Authenticator uygulamanızdaki 6 haneli kodu veya kurtarma kodunuzu girin.' : 'E-posta veya kullanıcı adınızla oturum açın.' }}</p>
        </div>
        
        <form v-if="!requires2FA" @submit.prevent="handleLogin" class="auth-form">
          <div v-if="error" class="error-message">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ error }}
          </div>

          <div class="input-group">
            <label><i class="bi bi-person-fill"></i> E-posta veya Kullanıcı Adı</label>
            <input type="text" v-model="identifier" :class="{ 'invalid': validationErrors.identifier }" required placeholder="edward@akademi.org veya edwardsnowden" />
            <span v-if="validationErrors.identifier" class="field-error">{{ validationErrors.identifier }}</span>
          </div>

          <div class="input-group">
            <label><i class="bi bi-lock-fill"></i> Şifre</label>
            <input type="password" v-model="password" :class="{ 'invalid': validationErrors.password }" required placeholder="••••••••" />
            <span v-if="validationErrors.password" class="field-error">{{ validationErrors.password }}</span>
            <div class="forgot-password-row">
              <RouterLink to="/forgot-password" class="forgot-link">Şifreni mi unuttun?</RouterLink>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading || Object.keys(validationErrors).length > 0">
            <i v-if="!loading" class="bi bi-box-arrow-in-right"></i>
            <span v-else class="spinner"></span>
            {{ loading ? 'Giriş Yapılıyor...' : 'Giriş Yap' }}
          </button>

          <div class="oauth-divider">
            <span>Tembel misiniz? Hepimiz öyleyiz...</span>
          </div>
          
          <div class="oauth-buttons">
            <a href="http://localhost:5000/api/auth/google" class="oauth-btn google-btn">
              <i class="bi bi-google"></i> Google
            </a>
            <a href="http://localhost:5000/api/auth/github" class="oauth-btn github-btn">
              <i class="bi bi-github"></i> GitHub
            </a>
          </div>
        </form>

        <form v-else @submit.prevent="handle2FALogin" class="auth-form">
          <div v-if="error" class="error-message">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ error }}
          </div>

          <div class="input-group">
            <label><i class="bi bi-shield-lock-fill"></i> 2FA Kodu</label>
            <input type="text" v-model="twoFaCode" :class="{ 'invalid': validationErrors.twoFaCode }" required placeholder="000000" maxlength="8" style="letter-spacing: 5px; text-align: center; font-size: 1.5rem;" />
            <span v-if="validationErrors.twoFaCode" class="field-error">{{ validationErrors.twoFaCode }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading || Object.keys(validationErrors).length > 0">
            <i v-if="!loading" class="bi bi-check-circle"></i>
            <span v-else class="spinner"></span>
            {{ loading ? 'Doğrulanıyor...' : 'Doğrula' }}
          </button>
          
          <div class="form-footer mt-3" style="text-align: center;">
            <button type="button" @click="requires2FA = false" class="btn btn-link" style="color: var(--text-secondary); background: none; border: none; cursor: pointer;">
              <i class="bi bi-arrow-left"></i> Geri Dön
            </button>
          </div>
        </form>

        <div v-if="!requires2FA" class="form-footer">
          <p>Henüz hesabınız yok mu? <RouterLink to="/register">E bir tane oluşturun o zaman!</RouterLink></p>
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
  padding: 2rem;
}

.auth-wrapper {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  width: 100%;
  max-width: 1100px;
  min-height: 600px;
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
  padding: 3rem;
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
  font-size: 5rem;
  margin-bottom: 1.5rem;
  display: block;
}

.branding-group h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  font-family: 'Hermit', monospace;
}

.branding-group p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 3rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease;
}

.icon-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.2);
}

.icon-item i {
  font-size: 2rem;
}

.icon-item span {
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

.auth-form-area {
  padding: 4.5rem;
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

.input-group input {
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: 'Hermit', monospace;
  transition: all 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(215, 153, 33, 0.1);
}

.input-group input.invalid {
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

.forgot-password-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

.forgot-link {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: var(--accent);
}

.oauth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.oauth-divider::before, .oauth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.oauth-divider span {
  padding: 0 1rem;
  font-size: 0.9rem;
}

.oauth-buttons {
  display: flex;
  gap: 1rem;
}

.oauth-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
}

.oauth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0,0,0,0.1);
  background: var(--bg-primary);
}

.google-btn i { color: #ea4335; }
.github-btn i { color: var(--text-primary); }

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
