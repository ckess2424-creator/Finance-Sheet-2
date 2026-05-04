class FinanceApp {
    constructor() {
        this.data = {
            expenses: { usd: [], ils: [] },
            payslips: { usd: [], ils: [] },
            balances: { usdChecking: 0, usdSavings: 0, ils: 0 },
            balanceHistory: [],
            budgets: { usd: [], ils: [] },
            recurring: [],
            settings: {
                emailNotifications: false,
                cloudSync: false,
                email: '',
                exchangeRate: 3.5
            }
        };

        this.currentMonth = new Date();
        this.currentSavingsMonth = new Date();
        this.charts = {};

        this.loadData();
        this.init();
    }

    // ======================
    // DATA MANAGEMENT
    // ======================
    loadData() {
        const saved = localStorage.getItem('financeData');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading data:', e);
                this.saveData();
            }
        } else {
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('financeData', JSON.stringify(this.data));
    }

    exportData() {
        const blob = new Blob([JSON.stringify(this.data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData() {
        document.getElementById('importFile')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    this.data = JSON.parse(event.target.result);
                    this.saveData();
                    location.reload();
                } catch {
                    alert('Invalid file');
                }
            };
            reader.readAsText(file);
        });
    }

    clearAllData() {
        if (confirm('Delete ALL data?')) {
            localStorage.removeItem('financeData');
            location.reload();
        }
    }

    // ======================
    // INIT
    // ======================
    init() {
        this.setupTabs();
        this.setupExpenses();
        this.setupBalances();
    }

    setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                document.querySelectorAll('.tab-content')
                    .forEach(t => t.classList.remove('active'));

                document.querySelectorAll('.tab-btn')
                    .forEach(b => b.classList.remove('active'));

                document.getElementById(tab).classList.add('active');
                btn.classList.add('active');
            });
        });
    }

    // ======================
    // EXPENSES
    // ======================
    setupExpenses() {
        document.getElementById('usdExpenseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense('usd');
            this.renderExpenses();
        });

        document.getElementById('ilsExpenseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense('ils');
            this.renderExpenses();
        });

        this.renderExpenses();
    }

    addExpense(currency) {
        this.data.expenses[currency].push({
            id: Date.now(),
            date: document.getElementById(`${currency}ExpenseDate`).value,
            category: document.getElementById(`${currency}ExpenseCategory`).value,
            amount: parseFloat(document.getElementById(`${currency}ExpenseAmount`).value),
            notes: document.getElementById(`${currency}ExpenseNotes`)?.value || ''
        });

        this.saveData();
    }

    deleteExpense(currency, id) {
        this.data.expenses[currency] =
            this.data.expenses[currency].filter(e => e.id !== id);

        this.saveData();
        this.renderExpenses();
    }

    renderExpenses() {
        ['usd', 'ils'].forEach(currency => {
            const list = document.getElementById(`${currency}ExpensesList`);
            if (!list) return;

            list.innerHTML = '';

            let total = 0;

            this.data.expenses[currency].forEach(exp => {
                total += exp.amount;

                const div = document.createElement('div');
                div.className = 'list-item';

                const symbol = currency === 'usd' ? '$' : '₪';

                div.innerHTML = `
                    <div>
                        <strong>${exp.category}</strong><br>
                        <small>${exp.date}</small>
                    </div>
                    <div>${symbol}${exp.amount.toFixed(2)}</div>
                    <button onclick="app.deleteExpense('${currency}', ${exp.id})">X</button>
                `;

                list.appendChild(div);
            });

            const totalEl = document.getElementById(`${currency}Total`);
            if (totalEl) {
                const symbol = currency === 'usd' ? '$' : '₪';
                totalEl.textContent = `${symbol}${total.toFixed(2)}`;
            }
        });
    }

    // ======================
    // BALANCES
    // ======================
    setupBalances() {
        this.renderBalances();
    }

    updateBalance(key) {
        const input = document.getElementById(`${key}Input`);
        const value = parseFloat(input.value);

        if (!isNaN(value)) {
            this.data.balances[key] = value;
            this.saveData();
            this.renderBalances();
        }
    }

    renderBalances() {
        document.getElementById('usdCheckingDisplay').textContent =
            `$${this.data.balances.usdChecking.toFixed(2)}`;

        document.getElementById('usdSavingsDisplay').textContent =
            `$${this.data.balances.usdSavings.toFixed(2)}`;

        document.getElementById('ilsDisplay').textContent =
            `₪${this.data.balances.ils.toFixed(2)}`;
    }
}

// START APP
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinanceApp();
});
