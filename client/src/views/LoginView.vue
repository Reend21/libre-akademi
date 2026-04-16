<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const identifier = ref('') // Email or Username
const password = ref('')

const handleLogin = () => {
  // Simple simulation
  authStore.login({ name: identifier.value, identifier: identifier.value })
  alert('Giriş başarılı!')
  router.push('/')
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
            <h1>Hoş Geldiniz!</h1>
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
          <h2>Giriş Yap</h2>
          <p>E-posta veya kullanıcı adınızla oturum açın.</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="input-group">
            <label><i class="bi bi-person-fill"></i> E-posta veya Kullanıcı Adı</label>
            <input type="text" v-model="identifier" required placeholder="can@akademi.org veya canyilmaz" />
          </div>

          <div class="input-group">
            <label><i class="bi bi-lock-fill"></i> Şifre</label>
            <input type="password" v-model="password" required placeholder="••••••••" />
          </div>

          <button type="submit" class="submit-btn">
            <i class="bi bi-box-arrow-in-right"></i> Giriş Yap
          </button>
        </form>

        <div class="form-footer">
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
