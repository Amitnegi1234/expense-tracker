const form=document.querySelector('form');
const API_BASE = "http://localhost:3000";
const emailErrorDiv = document.getElementById('emailError');
const emailInput = document.querySelector('input[name="email"]');
form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    emailErrorDiv.textContent = '';
    emailInput.classList.remove('error');
    const f=new FormData(e.target);
    const name=f.get('name');
    const email=f.get('email');
    const password=f.get('password');
    // console.log(name,email,password);
    const user={name,email,password};
   try {
        const response=await axios.post(`${API_BASE}/user/add`,user);
        alert(response.data);
        window.location.href = "login.html";
        form.reset();
   } catch (error) {
        if (
            error.response &&
            typeof error.response.data === 'string' &&
            error.response.data.toLowerCase().includes("email")
        ) {
            emailInput.classList.add('error');
            emailErrorDiv.textContent = error.response.data;
        } else {
            console.error("Unexpected error:", error);
        }
   }
    
})

