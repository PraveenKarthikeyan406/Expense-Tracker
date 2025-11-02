import React from 'react';

const Charts = () => {
  const balanceHistory = [
    { date: 'Apr', balance: 11500 },
    { date: 'May', balance: 11600 },
    { date: 'Jun', balance: 11550 },
    { date: 'Jul', balance: 11600 },
    { date: 'Aug', balance: 11500 },
    { date: 'Sep', balance: 12800 },
    { date: 'Oct', balance: 12700 },
    { date: 'Nov', balance: 12900 },
    { date: 'Dec', balance: 13600 }
  ];

  const weeklyExpenses = [
    { day: '1 Jun', amount: 200 },
    { day: '8 Jun', amount: 45 },
    { day: '15 Jun', amount: 180 },
    { day: '22 Jun', amount: 70 },
    { day: '29 Jun', amount: 150 },
    { day: '6 Jul', amount: 45 },
    { day: '13 Jul', amount: 30 }
  ];
  
  const budgets = [
    { category: 'Entertainment', spent: 45.00, budget: 80.00, percentage: 56, date: 'Sep 2023', icon: '🎮' },
    { category: 'Shopping', spent: 65.00, budget: 150.00, percentage: 43, date: 'Sep 2023', icon: '🛒' },
    { category: 'Food', spent: 85.00, budget: 200.00, percentage: 42, date: 'Sep 2023', icon: '🍔' },
    { category: 'Bitcoin', spent: 0.00, budget: 100.00, percentage: 0, date: 'Sep 2023', icon: '₿' }
  ];
  
  const transactions = [
    { name: 'Burger', amount: -8.00, date: 'Sep 2023', icon: '🍔' },
    { name: 'Salary', amount: 1500.00, date: 'Sep 2023', icon: '💼' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const maxBalance = Math.max(...balanceHistory.map(item => item.balance));
  const maxExpense = Math.max(...weeklyExpenses.map(item => item.amount));

  return (
    <div className="charts-container">
      {}
      <div className="chart-section">
        <div className="section-header">
          <h3>Balance</h3>
        </div>
        <div className="line-chart">
          <div className="chart-y-axis">
            {['$14k', '$13.5k', '$13k', '$12.5k', '$12k', '$11.5k', '$11k'].map((label, index) => (
              <div key={index} className="y-axis-label">{label}</div>
            ))}
          </div>
          <div className="chart-content">
            <svg width="100%" height="200" viewBox="0 0 800 200" preserveAspectRatio="none">
              <polyline
                points="0,180 100,170 200,175 300,170 400,180 500,80 600,90 700,70 800,20"
                fill="none"
                stroke="#2196F3"
                strokeWidth="3"
              />
              <path
                d="M0,180 100,170 200,175 300,170 400,180 500,80 600,90 700,70 800,20 L800,200 L0,200 Z"
                fill="rgba(33, 150, 243, 0.1)"
              />
            </svg>
            <div className="x-axis-labels">
              {balanceHistory.map((item, index) => (
                <div key={index} className="x-axis-label">{item.date}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="chart-section">
        <div className="section-header">
          <h3>Last 7 days</h3>
          <button className="icon-button"><span className="material-icons">more_vert</span></button>
        </div>
        <div className="bar-chart">
          {weeklyExpenses.map((item, index) => (
            <div key={index} className="bar-container">
              <div 
                className="bar" 
                style={{ 
                  height: `${(item.amount / maxExpense) * 100}%`,
                  backgroundColor: item.amount > 50 ? '#F44336' : '#4CAF50'
                }}
              ></div>
              <div className="bar-label">{item.day}</div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="budgets-section">
        <div className="section-header">
          <h3>Budgets</h3>
          <button className="icon-button">See all</button>
        </div>
        <div className="budgets-list">
          {budgets.map((budget, index) => (
            <div key={index} className="budget-item">
              <div className="budget-icon">{budget.icon}</div>
              <div className="budget-details">
                <div className="budget-category">{budget.category}</div>
                <div className="budget-date">{budget.date}</div>
                <div className="budget-progress">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${budget.percentage}%`,
                      backgroundColor: budget.percentage > 80 ? '#F44336' : '#4CAF50'
                    }}
                  ></div>
                </div>
                <div className="budget-amounts">
                  <span className="spent">{formatCurrency(budget.spent)}</span>
                  <span className="budget">{formatCurrency(budget.budget)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {}
      <div className="transactions-section">
        <div className="section-header">
          <h3>Cash flow (Transactions)</h3>
          <button className="icon-button">See all</button>
        </div>
        <div className="transactions-list">
          {transactions.map((transaction, index) => (
            <div key={index} className="transaction-item">
              <div className="transaction-icon">{transaction.icon}</div>
              <div className="transaction-details">
                <div className="transaction-name">{transaction.name}</div>
                <div className="transaction-date">{transaction.date}</div>
              </div>
              <div className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
  );
};

export default Charts;