class FinanceApp {
  constructor() {
    this.expenses = [];
    this.balance = 0;

    this.load();
    this.initTabs();
    this.render();
  }

  // STORAGE
  save() {
    localStorage.setItem("financeData", JSON.stringify({
      expenses: this.expenses,
      balance: this.balance
    }));
  }

  load() {
    const data = JSON.parse(localStorage.getItem("financeData"));
    if (data) {
      this.expenses = data.expenses || [];
      this.balance = data.balance || 0;
    }
  }

  // TABS
  initTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
      });
    });
  }

  // EXPENSES
  addExpense() {
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);

    if (!category || isNaN(amount)) {
      alert("Enter valid data");
      return;
    }

    this.expenses.push({ id: Date.now(), category, amount });
    this.save();
    this.render();

    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
  }

  deleteExpense(id) {
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.save();
    this.render();
  }

  // BALANCE
  updateBalance() {
    const value = parseFloat(document.getElementById("balanceInput").value);

    if (isNaN(value)) {
      alert("Enter a number");
      return;
    }

    this.balance = value;
    this.save();
    this.render();
  }

  // RENDER
  render() {
    const list = document.getElementById("expensesList");
    list.innerHTML = "";

    this.expenses.forEach(e => {
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        ${e.category} - $${e.amount}
        <button onclick="app.deleteExpense(${e.id})">X</button>
      `;

      list.appendChild(div);
    });

    document.getElementById("balanceDisplay").textContent = `$${this.balance}`;
  }
}

// START APP
const app = new FinanceApp();
