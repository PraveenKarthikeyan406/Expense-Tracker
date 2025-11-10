import React, { useState, useEffect } from 'react';
import { fetchExpenses } from '../services/expenses';
import { format } from 'date-fns';

export default function ViewProfilePage({ user, token, onClose }) {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    totalTransactions: 0,
    avgExpense: 0,
    avgIncome: 0,
    topCategory: 'N/A'
  });

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      
      try {
        const allExpenses = await fetchExpenses(token, {});
        setExpenses(allExpenses);
        
        // Calculate statistics
        let totalExp = 0;
        let totalInc = 0;
        let expenseCount = 0;
        let incomeCount = 0;
        const categoryTotals = {};

        allExpenses.forEach(exp => {
          if (exp.amount < 0) {
            totalExp += Math.abs(exp.amount);
            expenseCount++;
            const cat = exp.category || 'Uncategorized';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(exp.amount);
          } else {
            totalInc += exp.amount;
            incomeCount++;
          }
        });

        const topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

        setStats({
          totalExpenses: totalExp,
          totalIncome: totalInc,
          totalTransactions: allExpenses.length,
          avgExpense: expenseCount > 0 ? totalExp / expenseCount : 0,
          avgIncome: incomeCount > 0 ? totalInc / incomeCount : 0,
          topCategory: topCat ? topCat[0] : 'N/A'
        });
      } catch (err) {
        console.error('Failed to load profile data:', err);
      }
    }
    
    loadData();
  }, [token]);

  const getInitials = () => {
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const memberSince = user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Recently';

  return (
    <div className="view-profile-page">
      <div className="profile-page-header">
        <button className="back-button" onClick={onClose}>
          <span>←</span> Back
        </button>
        <h2>Profile</h2>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-xl">{getInitials()}</div>
            <h3>{user.name || 'User'}</h3>
            <p className="profile-email">{user.email}</p>
            <p className="profile-member-since">Member since {memberSince}</p>
          </div>

          <div className="profile-details-section">
            <h4>Personal Information</h4>
            <div className="profile-detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user.name || 'Not set'}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{user.phone || 'Not set'}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Location</span>
              <span className="detail-value">{user.location || 'Not set'}</span>
            </div>
          </div>
        </div>

        <div className="profile-stats-section">
          <h4>Financial Statistics</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon expense-icon">💸</div>
              <div className="stat-content">
                <p className="stat-label">Total Expenses</p>
                <p className="stat-value expense-value">₹{stats.totalExpenses.toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon income-icon">💰</div>
              <div className="stat-content">
                <p className="stat-label">Total Income</p>
                <p className="stat-value income-value">₹{stats.totalIncome.toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon transaction-icon">📊</div>
              <div className="stat-content">
                <p className="stat-label">Total Transactions</p>
                <p className="stat-value">{stats.totalTransactions}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon avg-icon">📈</div>
              <div className="stat-content">
                <p className="stat-label">Avg Expense</p>
                <p className="stat-value">₹{stats.avgExpense.toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon avg-icon">📉</div>
              <div className="stat-content">
                <p className="stat-label">Avg Income</p>
                <p className="stat-value">₹{stats.avgIncome.toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon category-icon">🏆</div>
              <div className="stat-content">
                <p className="stat-label">Top Category</p>
                <p className="stat-value">{stats.topCategory}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-about-section">
          <h4>About</h4>
          <p className="about-text">
            {user.bio || 'Fast Budget helps you track your expenses and income efficiently. Set your financial goals and monitor your spending habits to achieve better financial health.'}
          </p>
        </div>
      </div>
    </div>
  );
}
