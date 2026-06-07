<script setup>
import { ref } from 'vue'
import { authApi } from '../api/auth'

const email = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')
const devResetUrl = ref('')

const handleSubmit = async () => {
  if (!email.value || !email.value.includes('@')) {
    error.value = 'Lütfen geçerli bir e-posta adresi girin.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const data = await authApi.forgotPassword(email.value)
    success.value = true
    if (data.devResetUrl) {
      devResetUrl.value = data.devResetUrl
    }
  } catch (err) {
    error.value = err.message || 'Bir hata oluştu, lütfen tekrar deneyin.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="forgot-card glass">
      <div class="card-icon">
        <i class="bi bi-shield-lock-fill"></i>
      </div>

      <template v-if="!success">
        <h1>Şifremi Unuttum!</h1>
        <p class="subtitle">Neyse ki biz hatırlıyoruz, B12'lerinizi eksik etmeyin ve bize hesabınızın e-postasını verin de şifrenizi gönderelim.</p>

        <form @submit.prevent="handleSubmit" class="forgot-form">
          <div v-if="error" class="error-message">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ error }}
          </div>

          <div class="input-group">
            <label><i class="bi bi-envelope-fill"></i> E-posta Adresi</label>
            <input
              type="email"
              v-model="email"
              required
              placeholder="edward@akademi.org"
              :disabled="loading"
            />
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <i v-else class="bi bi-send-fill"></i>
            {{ loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder' }}
          </button>
        </form>
      </template>

      <template v-else>
        <div class="success-state">
          <div class="success-icon">
            <i class="bi bi-envelope-check-fill"></i>
          </div>
          <h2>Bağlantı Gönderildi!</h2>
          <p>
            Eğer <strong>{{ email }}</strong> adresiyle kayıtlı bir hesap varsa,
            şifre sıfırlama bağlantısı e-postanıza iletildi. Spam klasörünüze de bakın ve sabırlı olun.
          </p>

          <!-- Dev mode only: show link in UI -->
          <div v-if="devResetUrl" class="dev-notice">
            <i class="bi bi-bug-fill"></i>
            <strong>Geliştirici Modu:</strong>
            <a :href="devResetUrl" class="dev-link">Sıfırlama bağlantısına git →</a>
          </div>
        </div>
      </template>

      <div class="form-footer">
        <RouterLink to="/login"><i class="bi bi-arrow-left"></i>Boşver, hatırladım.</RouterLink>
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

.forgot-card {
  width: 100%;
  max-width: 480px;
  padding: 3rem;
  border-radius: 24px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.glass {
  backdrop-filter: blur(10px);
}

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

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

/* Success state */
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

.success-icon i {
  font-size: 3rem;
  color: #8ec07c;
}

@keyframes pop-in {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
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

.dev-notice {
  background: rgba(250, 189, 47, 0.1);
  border: 1px solid rgba(250, 189, 47, 0.3);
  border-radius: 10px;
  padding: 0.8rem 1rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  color: var(--text-secondary);
}

.dev-notice i { color: #fabd2f; }
.dev-link {
  color: var(--accent);
  font-weight: 700;
  text-decoration: none;
}
.dev-link:hover { text-decoration: underline; }

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
