class FinanceApp {
  constructor() {
    this.data = {
      expenses: { usd: [], ils: [] },
      payslips: { usd: [], ils: [] },
      balances: { usd: 0, ils: 0 }
    };

    this.load();
    this.initTabs();
    this.render();
  }

  // STORAGE
  save() {
    localStorage.setItem("financeData", JSON.stringify(this.data));
  }

  load() {
    const saved = JSON.parse(localStorage.getItem("financeData"));
    if (saved) this.data = saved;
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
    const currency = document.getElementById("expenseCurrency").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);

    if (!category || isNaN(amount)) return alert("Fill all fields");

    this.data.expenses[currency].push({
      id: Date.now(),
      category,
      amount
    });

    this.save();
    this.render();
  }

  deleteExpense(currency, id) {
    this.data.expenses[currency] =
      this.data.expenses[currency].filter(e => e.id !== id);

    this.save();
    this.render();
  }

  // PAYSLIPS
  addPayslip() {
    const currency = document.getElementById("payslipCurrency").value;
    const income = parseFloat(document.getElementById("income").value);
    const tax = parseFloat(document.getElementById("tax").value);

    if (isNaN(income) || isNaN(tax)) return alert("Fill all fields");

    this.data.payslips[currency].push({
      id: Date.now(),
      income,
      tax
    });

    this.save();
    this.render();
  }

  deletePayslip(currency, id) {
    this.data.payslips[currency] =
      this.data.payslips[currency].filter(p => p.id !== id);

    this.save();
    this.render();
  }

  // BALANCE
  updateBalance() {
    const usd = parseFloat(document.getElementById("usdBalance").value) || 0;
    const ils = parseFloat(document.getElementById("ilsBalance").value) || 0;

    this.data.balances.usd = usd;
    this.data.balances.ils = ils;

    this.save();
    this.render();
  }

  // RENDER
  render() {
    const expList = document.getElementById("expensesList");
    expList.innerHTML = "";

    ["usd", "ils"].forEach(currency => {
      this.data.expenses[currency].forEach(e => {
        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
          ${currency.toUpperCase()} - ${e.category} - ${e.amount}
          <button onclick="app.deleteExpense('${currency}', ${e.id})">X</button>
        `;

        expList.appendChild(div);
      });
    });

    const payList = document.getElementById("payslipsList");
    payList.innerHTML = "";

    ["usd", "ils"].forEach(currency => {
      this.data.payslips[currency].forEach(p => {
        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
          ${currency.toUpperCase()} - Income: ${p.income} | Tax: ${p.tax}
          <button onclick="app.deletePayslip('${currency}', ${p.id})">X</button>
        `;

        payList.appendChild(div);
      });
    });

    document.getElementById("balanceDisplay").textContent =
      `USD: $${this.data.balances.usd} | ILS: ₪${this.data.balances.ils}`;
  }
}

// START
const app = new FinanceApp();
