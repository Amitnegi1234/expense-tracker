const form = document.querySelector('#user');
const API_BASE = "http://localhost:3000";
const emailErrorDiv = document.getElementById('emailError');
const emailInput = document.querySelector('input[name="email"]');
const passwordInput = document.querySelector('input[name="password"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  emailErrorDiv.textContent = '';
  emailInput.classList.remove('error');
  passwordInput.classList.remove('error');

  const f = new FormData(form);
  const email = f.get('email');
  const password = f.get('password');

  try {
    const response = await axios.post(`${API_BASE}/user/login`, {
      email,
      password,
    });

    alert(response.data.message); 
    localStorage.setItem('token',response.data.token)
    localStorage.removeItem('showLeaderboard'); 
        form.reset();
    window.location.href = "expense.html";


  } catch (error) {
    if (error.response) {
      const message = error.response.data.toLowerCase();

      if (message.includes("email")) {
        emailErrorDiv.textContent = error.response.data;
        emailInput.classList.add('error');
      } else if (message.includes("password")) {
        emailErrorDiv.textContent = error.response.data;
        passwordInput.classList.add('error');
      } else {
        emailErrorDiv.textContent = "Login failed. Try again.";
      }
    } else {
      console.error("Unexpected error:", error);
    }
  }
});
