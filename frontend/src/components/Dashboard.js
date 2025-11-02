import React, { useState } from 'react';

const Dashboard = ({ expenses }) => {
  const [activeView, setActiveView] = useState('overview');
  

  const calculateSummary = () => {
    const balance = 13627.71;
    const creditCards = -8249.00;
    const totalBalance = balance + creditCards;
    
    const thisMonth = {
      income: 1452.00,
      expenses: -573.53,
      balance: 878.47
    };
    
    const lastMonth = {
      income: 1500.00,
      expenses: -388.76,
      balance: 1111.24
    };
    
    return { balance, creditCards, totalBalance, thisMonth, lastMonth };
  };
  
  const summary = calculateSummary();
  
  const accounts = [
    { name: 'Wallet', balance: 90.24, currency: 'USD' },
    { name: 'Bank account', balance: 13537.47, currency: 'USD' }
  ];
  
  const creditCards = [
    { name: 'Credit card', balance: -189.00, usedPercentage: 19 }
  ];
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Summary</h2>
      </div>
      
      {}
      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-header">
            <h3>Balance:</h3>
            <span className="amount positive">{formatCurrency(summary.balance)}</span>
          </div>
          <div className="summary-header">
            <h3>Credit cards:</h3>
            <span className="amount negative">{formatCurrency(summary.creditCards)}</span>
          </div>
          <div className="summary-total">
            <span className="amount positive">{formatCurrency(summary.totalBalance)}</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-header">
            <h3>This month</h3>
            <div className="donut-chart">
              <div className="chart-placeholder" style={{ background: 'conic-gradient(#f44336 28.3%, #4CAF50 0)' }}></div>
            </div>
          </div>
          <div className="summary-details">
            <div className="income">
              <span className="amount positive">{formatCurrency(summary.thisMonth.income)}</span>
            </div>
            <div className="expenses">
              <span className="amount negative">{formatCurrency(summary.thisMonth.expenses)}</span>
            </div>
            <div className="balance">
              <span className="amount positive">{formatCurrency(summary.thisMonth.balance)}</span>
            </div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-header">
            <h3>Last month</h3>
            <div className="donut-chart">
              <div className="chart-placeholder" style={{ background: 'conic-gradient(#f44336 20.6%, #4CAF50 0)' }}></div>
            </div>
          </div>
          <div className="summary-details">
            <div className="income">
              <span className="amount positive">{formatCurrency(summary.lastMonth.income)}</span>
            </div>
            <div className="expenses">
              <span className="amount negative">{formatCurrency(summary.lastMonth.expenses)}</span>
            </div>
            <div className="balance">
              <span className="amount positive">{formatCurrency(summary.lastMonth.balance)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {}
      <div className="accounts-section">
        <div className="section-header">
          <h3>Accounts</h3>
          <button className="icon-button"><span className="material-icons">more_vert</span></button>
        </div>
        <div className="accounts-list">
          {accounts.map((account, index) => (
            <div key={index} className="account-item">
              <div className="account-name">{account.name}</div>
              <div className="account-balance">
                <span className="amount positive">{formatCurrency(account.balance)}</span>
                <span className="currency">{account.currency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {}
      <div className="credit-cards-section">
        <div className="section-header">
          <h3>Credit cards</h3>
          <button className="icon-button"><span className="material-icons">more_vert</span></button>
        </div>
        <div className="credit-cards-list">
          {creditCards.map((card, index) => (
            <div key={index} className="credit-card-item">
              <div className="card-details">
                <div className="card-name">{card.name}</div>
                <div className="card-balance">
                  <span className="amount negative">{formatCurrency(card.balance)}</span>
                </div>
              </div>
              <div className="card-usage">
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${card.usedPercentage}%` }}></div>
                </div>
                <div className="usage-percentage">{card.usedPercentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;