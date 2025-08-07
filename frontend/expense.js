let currentPage = 1;
let itemsPerPage = 2;

document.addEventListener("DOMContentLoaded", () => {

  // ✅ Redirect to login if no token
  if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
    return;
  }

  if (localStorage.getItem("isPremium") === "true") {
    showPremiumMessage();
  }

  checkPremiumStatus();
  fetchExpenses();

  // ✅ Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  const form = document.querySelector("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    if (!amount || !description || category === "...") {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/expense/addExpense",
        { amount, description, category },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      form.reset();
      fetchExpenses();
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  });

  const leaderboardBtn = document.getElementById("leaderboard-btn");
  leaderboardBtn.addEventListener("click", async () => {
    await fetchLeaderboard();
    localStorage.setItem("showLeaderboard", "true");
  });

  if (localStorage.getItem("showLeaderboard") === "true") {
    fetchLeaderboard();
  }

  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchExpenses();
    }
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    currentPage++;
    fetchExpenses();
  });

  const paginationDropdown = document.getElementById("pagination");
  paginationDropdown.value = itemsPerPage;
  paginationDropdown.addEventListener("change", (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    fetchExpenses();
  });



  const cashfree = Cashfree({ mode: "sandbox" });
  document.getElementById("payBtn").addEventListener("click", async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/payment",
        {},
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      const { payment_session_id, order_id } = response.data;
      localStorage.setItem("order_id", order_id);
      await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      });
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment failed. Check console.");
    }
  });

  // CHECK PAYMENT STATUS AFTER REDIRECT
  const params = new URLSearchParams(window.location.search);
  let orderId = params.get("order_id") || localStorage.getItem("order_id");
  if (orderId) {
    verifyPayment(orderId);
  }
});

async function fetchExpenses() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `http://localhost:3000/expense/show?limit=${itemsPerPage}&page=${currentPage}`,
      { headers: { Authorization: token } } 
    );

    const expenses = res.data.expenses;
    const totalCount = res.data.totalCount;

    const ul = document.getElementById("ul");
    ul.innerHTML = "";

    expenses.forEach((expense) => {
      const li = document.createElement("li");
      li.textContent = `₹${expense.amount} - ${expense.description} - [${expense.category}]`;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.marginLeft = "10px";
      deleteBtn.addEventListener("click", async () => {
        await deleteExpense(expense.id);
      });

      li.appendChild(deleteBtn);
      ul.appendChild(li);
    });

    const totalPages = Math.ceil(totalCount / itemsPerPage);
    document.getElementById("page-info").textContent = `Page ${currentPage} of ${totalPages}`;

    document.getElementById("prev-btn").style.display = currentPage > 1 ? "inline" : "none";
    document.getElementById("next-btn").style.display = currentPage < totalPages ? "inline" : "none";
  } catch (err) {
    console.error("Error fetching expenses:", err);
  }
}

async function deleteExpense(id) {
  try {
    await axios.delete(`http://localhost:3000/expense/delete/${id}`, {
      headers: { Authorization: localStorage.getItem("token") },
    });

    const res = await axios.get(
      `http://localhost:3000/expense/show?limit=${itemsPerPage}&page=${currentPage}`,
      { headers: { Authorization: localStorage.getItem("token") } }
    );

    if (res.data.expenses.length === 0 && currentPage > 1) {
      currentPage--;
    }

    fetchExpenses();
  } catch (err) {
    console.error("Error deleting expense:", err);
  }
}

async function fetchLeaderboard() {
  const leaderboardList = document.getElementById("leaderboard-list");
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      "http://localhost:3000/expense/premium/showLeaderBoard",
      { headers: { Authorization: token } }
    );

    leaderboardList.innerHTML = "";
    res.data.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `Name: ${entry.name} -- Expense: ₹${entry.totalExpense}`;
      leaderboardList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
  }
}

async function verifyPayment(orderId) {
  try {
    const res = await axios.post(
      `http://localhost:3000/verify?order_id=${orderId}`,
      {},
      { headers: { Authorization: localStorage.getItem("token") } }
    );

    if (res.data.status === "Success") {
      localStorage.setItem("isPremium", "true");
      showPremiumMessage();
      localStorage.removeItem("order_id");
    }
    alert(`Payment Status: ${res.data.status}`);
  } catch (err) {
    console.error("Verification failed", err);
  }
}

async function checkPremiumStatus() {
  try {
    const res = await axios.get("http://localhost:3000/check-premium", {
      headers: { Authorization: localStorage.getItem("token") }
    });

    if (res.data.isPremium) {
      showPremiumMessage();
      localStorage.setItem("isPremium", "true");
    } else {
      localStorage.removeItem("isPremium");
    }
  } catch (err) {
    console.error("Error checking premium status:", err);
  }
}

function showPremiumMessage() {
  let premiumHeader = document.getElementById("premium-header");
  if (!premiumHeader) {
    premiumHeader = document.createElement("h1");
    premiumHeader.id = "premium-header";
    premiumHeader.textContent = "You are a premium user now";
    premiumHeader.style.color = "gold";
    premiumHeader.style.textAlign = "center";
    document.body.insertBefore(premiumHeader, document.body.firstChild);
  }
}


document.getElementById('download-expenses').addEventListener('click', async () => {
    const downloadBtn = document.getElementById('download-expenses');
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Downloading...';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to download expenses');
            return;
        }

        // Check premium status
        const premiumRes = await axios.get('http://localhost:3000/check-premium', {
            headers: { Authorization: token }
        });

        if (!premiumRes.data.isPremium) {
            alert('You must be a premium user to download expenses');
            return;
        }

        const res = await fetch('http://localhost:3000/expense/download', {
            headers: { Authorization: token }
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        if (data.success) {
            if (data.fileUrl) {
                window.open(data.fileUrl);
            } else {
                alert(data.message || 'No expenses to download');
            }
        } else {
            alert(data.message || 'Failed to download expenses');
        }
    } catch (err) {
        console.error('Download error:', err);
        alert(`Failed to download expenses: ${err.message}`);
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download Expenses';
    }
});