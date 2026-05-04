class FinanceApp {
    constructor() {
        this.data = {
            expenses: { usd: [], ils: [] },
            payslips: { usd: [], ils: [] },
            balances: { usdChecking: 0, usdSavings: 0, ils: 0 },
            balanceHistory: [],
            budgets: { usd: [], ils: [] },
            recurring: [],
            settings: { emailNotifications: false, cloudSync: false, email: '', exchangeRate: 3.5 }
        };

        this.currentMonth = new Date();
        this.currentSavingsMonth = new Date();
        this.charts = {};

        this.loadData();
        this.init();
    }

    // ===== DATA MANAGEMENT =====
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
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        alert('Data exported successfully!');
    }

    importData() {
        document.getElementById('importFile')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    this.data = imported;
                    this.saveData();
                    alert('Data imported successfully!');
                    location.reload();
                } catch (err) {
                    alert('Error importing data');
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

    // ===== INIT =====
    init() {
        this.setupTabs();
    }

    setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

                document.getElementById(tab).classList.add('active');
                btn.classList.add('active');
            });
        });
    }

    // ===== EXPENSES =====
    addExpense(currency) {
        const date = document.getElementById(`${currency}ExpenseDate`).value;
        const category = document.getElementById(`${currency}ExpenseCategory`).value;
        const amount = parseFloat(document.getElementById(`${currency}ExpenseAmount`).value);
        const notes = document.getElementById(`${currency}ExpenseNotes`)?.value || '';

        this.data.expenses[currency].push({
            id: Date.now(),
            date,
            category,
            amount,
            notes
        });

        this.saveData();
        this.renderExpenses();
    }

    deleteExpense(currency, id) {
        this.data.expenses[currency] = this.data.expenses[currency].filter(e => e.id !== id);
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
                    <div>
                        ${symbol}${exp.amount.toFixed(2)}
                    </div>
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

    // ===== BALANCES =====
    updateBalance(key) {
        const input = document.getElementById(`${key}Input`);
        const value = parseFloat(input.value);

        if (!isNaN(value)) {
            this.data.balances[key] = value;
            this.saveData();
            alert('Balance updated');
        }
    }
}

// START APP
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinanceApp();
});