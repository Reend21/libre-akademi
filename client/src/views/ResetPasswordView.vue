<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '../api/auth'

const route = useRoute()
const router = useRouter()

const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const token = route.params.token

const strengthScore = computed(() => {
  const p = password.value
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthClass = computed(() => {
  if (strengthScore.value <= 1) return 'weak'
  if (strengthScore.value <= 3) return 'medium'
  return 'strong'
})

const strengthWidth = computed(() => `${Math.min(100, strengthScore.value * 20)}%`)

const strengthLabel = computed(() => {
  if (!password.value) return ''
  if (strengthScore.value <= 1) return 'Zayıf şifre'
  if (strengthScore.value <= 3) return 'Orta güçte şifre'
  return 'Güçlü şifre ✓'
})

const handleSubmit = async () => {
  error.value = ''
  if (password.value.length < 8) {
    error.value = 'Şifre en az 8 karakter olmalıdır.'
    return
  }
  if (password.value !== passwordConfirm.value) {
    error.value = 'Şifreler eşleşmiyor.'
    return
  }
  loading.value = true
  try {
    await authApi.resetPassword(token, password.value)
    success.value = true
    setTimeout(() => router.push('/login'), 3000)
  } catch (err) {
    error.value = err.message || 'Bir hata oluştu. Bağlantı geçersiz veya süresi dolmuş olabilir.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="reset-card glass">
      <div class="card-icon">
        <i class="bi bi-key-fill"></i>
      </div>

      <template v-if="!success">
        <h1>Yeni Şifre Belirle</h1>
        <p class="subtitle">Hesabınız için güçlü bir şifre seçin.</p>

        <form @submit.prevent="handleSubmit" class="reset-form">
          <div v-if="error" class="error-message">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ error }}
          </div>

          <div class="input-group">
            <label><i class="bi bi-lock-fill"></i> Yeni Şifre</label>
            <input
              type="password"
              v-model="password"
              required
              placeholder="En az 8 karakter"
              :disabled="loading"
            />
          </div>

          <div class="input-group">
            <label><i class="bi bi-lock-fill"></i> Şifre Tekrar</label>
            <input
              type="password"
              v-model="passwordConfirm"
              required
              placeholder="Şifrenizi tekrar girin"
              :disabled="loading"
            />
          </div>

          <div class="strength-bar">
            <div
              class="strength-fill"
              :class="strengthClass"
              :style="{ width: strengthWidth }"
            ></div>
          </div>
          <p class="strength-label">{{ strengthLabel }}</p>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <i v-else class="bi bi-check-circle-fill"></i>
            {{ loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle' }}
          </button>
        </form>
      </template>

      <template v-else>
        <div class="success-state">
          <div class="success-icon">
            <i class="bi bi-shield-check-fill"></i>
          </div>
          <h2>Şifre Güncellendi!</h2>
          <p>Şifreniz başarıyla değiştirildi. 3 saniye içinde giriş sayfasına yönlendiriliyorsunuz...</p>
          <RouterLink to="/login" class="login-link">Hemen Giriş Yap →</RouterLink>
        </div>
      </template>

      <div class="form-footer" v-if="!success">
        <RouterLink to="/login"><i class="bi bi-arrow-left"></i> Giriş sayfasına dön</RouterLink>
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

.reset-card {
  width: 100%;
  max-width: 480px;
  padding: 3rem;
  border-radius: 24px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.glass { backdrop-filter: blur(10px); }

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.card-icon i {
  font-size: 2.5rem;
  color: var(--accent);
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
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
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Hermit', monospace;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(215, 153, 33, 0.1);
}

.strength-bar {
  height: 6px;
  background: var(--border-color);
  border-radius: 999px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease, background 0.4s ease;
}

.strength-fill.weak   { background: #fb4934; }
.strength-fill.medium { background: #fabd2f; }
.strength-fill.strong { background: #8ec07c; }

.strength-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-height: 1.2em;
  text-align: left;
  margin: 0;
}

.submit-btn {
  padding: 0.9rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--accent);
  color: #fff;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 0.5rem;
}

[data-theme="dark"] .submit-btn { color: #282828; }

.submit-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.2);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background: rgba(251, 73, 52, 0.1);
  color: #fb4934;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(251, 73, 52, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.success-icon {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(142, 192, 124, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-icon i { font-size: 3rem; color: #8ec07c; }

@keyframes pop-in {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.success-state h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
}

.success-state p {
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 0.95rem;
}

.login-link {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.7rem 1.5rem;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
}

[data-theme="dark"] .login-link { color: #282828; }
.login-link:hover { background: var(--accent-hover); transform: translateY(-2px); }

.form-footer {
  margin-top: 2rem;
  text-align: center;
}

.form-footer a {
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.form-footer a:hover { color: var(--accent); }
</style>
