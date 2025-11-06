<template>
  <div class="top-bar-container">
    <div class="top-bar">
      <div class="logo-section">
        <img 
          src="../assets/logo.svg" 
          alt="Futurebox" 
          class="logo"
        >
        <p class="tagline">
          Технологии будущего дома
        </p>
      </div>
      
      <div class="actions">
        <button 
          class="btn-primary"
          @click="handleRequestClick"
        >
          Отправить запрос
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const handleRequestClick = () => {
  // Логика отправки запроса
  console.log('Запрос отправлен');
};
</script>

<style scoped>
.top-bar-container {
  padding: 32px 64px;
  width: 100%;
  box-sizing: border-box;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 64px;
  padding: 24px 64px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 12px;
  box-sizing: border-box;
  width: 100%;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 64px;
  flex: 1;
}

.logo {
  width: 158px;
  height: 24px;
  flex-shrink: 0;
}

.tagline {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: #444444;
  margin: 0;
  white-space: nowrap;
}

.actions {
  display: flex;
  align-items: center;
  gap: 40px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 20px;
  background: #2a9648;
  color: white;
  border: none;
  border-radius: 4px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-primary:hover {
  background: #248a3f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(42, 150, 72, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(42, 150, 72, 0.2);
}

.btn-primary:focus {
  outline: 2px solid #2a9648;
  outline-offset: 2px;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .top-bar-container {
    padding: 24px 32px;
  }
  
  .top-bar {
    padding: 20px 40px;
    gap: 32px;
  }
  
  .logo-section {
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .top-bar-container {
    padding: 16px 20px;
  }
  
  .top-bar {
    flex-direction: column;
    padding: 16px 24px;
    gap: 20px;
  }
  
  .logo-section {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .tagline {
    white-space: normal;
  }
  
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>

