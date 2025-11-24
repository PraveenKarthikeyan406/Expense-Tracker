import React, { useState, useEffect } from 'react';
import { fetchExpenses } from '../services/expenses';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { getCategoryEmoji } from './categoryIcons';
import html2pdf from 'html2pdf.js';

export default function ReportGenerator({ token, user, onClose }) {
  const [reportType, setReportType] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, [reportType, selectedDate, token]);

  const loadExpenses = async () => {
    if (!token) return;
    setLoading(true);

    try {
      let startDate, endDate;
      
      if (reportType === 'monthly') {
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
      } else if (reportType === 'yearly') {
        startDate = startOfYear(selectedDate);
        endDate = endOfYear(selectedDate);
      } else {
       
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
      }

      const data = await fetchExpenses(token, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      setExpenses(data);
      generateReport(data);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (data) => {
    let totalExpenses = 0;
    let totalIncome = 0;
    const categoryBreakdown = {};
    const incomeCategoryBreakdown = {};
    const dailyExpenses = {};
    const expenseTransactions = [];
    const incomeTransactions = [];

    data.forEach(exp => {
      const amount = Math.abs(exp.amount);
      const date = format(new Date(exp.date), 'yyyy-MM-dd');
      const category = exp.category || 'Uncategorized';

      if (exp.amount < 0) {
        totalExpenses += amount;
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;
        dailyExpenses[date] = (dailyExpenses[date] || 0) + amount;
        expenseTransactions.push(exp);
      } else {
        totalIncome += amount;
        incomeCategoryBreakdown[category] = (incomeCategoryBreakdown[category] || 0) + amount;
        incomeTransactions.push(exp);
      }
    });

    const sortedCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0
      }));

    const sortedIncomeCategories = Object.entries(incomeCategoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0
      }));

    const avgDailyExpense = Object.keys(dailyExpenses).length > 0
      ? totalExpenses / Object.keys(dailyExpenses).length
      : 0;

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;

    setReportData({
      totalExpenses,
      totalIncome,
      netSavings: totalIncome - totalExpenses,
      categoryBreakdown: sortedCategories,
      incomeCategoryBreakdown: sortedIncomeCategories,
      avgDailyExpense,
      transactionCount: data.length,
      expenseCount: expenseTransactions.length,
      incomeCount: incomeTransactions.length,
      expenseTransactions,
      incomeTransactions,
      savingsRate,
      period: reportType === 'monthly' 
        ? format(selectedDate, 'MMMM yyyy')
        : format(selectedDate, 'yyyy')
    });
  };

  const downloadReport = () => {
    if (!reportData) {
      alert('No report data available');
      return;
    }

    setDownloading(true);
    console.log('Generating PDF for period:', reportData.period);

    const reportHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Expense Report - ${reportData.period}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f5f7fa;
              padding: 20px;
              color: #333;
            }
            
            .report-container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 2px 20px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            
            .report-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              text-align: center;
            }
            
            .report-header h1 {
              font-size: 36px;
              margin-bottom: 10px;
              font-weight: 700;
            }
            
            .report-header .period {
              font-size: 20px;
              opacity: 0.95;
              font-weight: 400;
            }
            
            .report-header .generated-date {
              font-size: 14px;
              opacity: 0.85;
              margin-top: 10px;
            }
            
            .report-body {
              padding: 40px;
            }
            
            .user-details {
              margin-bottom: 30px;
              padding: 20px 24px;
              border-radius: 10px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
            }
            
            .user-details-header {
              font-size: 16px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #4a5568;
              margin-bottom: 12px;
            }
            
            .user-details-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            }
            
            .user-details-table td {
              padding: 6px 0;
            }
            
            .user-details-table td:first-child {
              width: 150px;
              color: #718096;
              font-weight: 600;
            }
            
            .user-details-table td:last-child {
              color: #2d3748;
            }
            
            .summary-section {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin-bottom: 40px;
            }
            
            .summary-card {
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              padding: 25px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
              transition: transform 0.3s ease;
            }
            
            .summary-card:hover {
              transform: translateY(-5px);
            }
            
            .summary-card.income {
              background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
            }
            
            .summary-card.expense {
              background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            }
            
            .summary-card.savings {
              background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
              color: white;
            }
            
            .summary-card.average {
              background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            }
            
            .summary-card .label {
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
              opacity: 0.8;
            }
            
            .summary-card .value {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 5px;
            }
            
            .summary-card .subtext {
              font-size: 13px;
              opacity: 0.75;
            }
            
            .section-title {
              font-size: 24px;
              font-weight: 700;
              margin: 40px 0 20px 0;
              padding-bottom: 10px;
              border-bottom: 3px solid #667eea;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .section-title.income-section {
              border-bottom-color: #4CAF50;
              color: #2e7d32;
            }
            
            .section-title.expense-section {
              border-bottom-color: #f44336;
              color: #c62828;
            }
            
            .category-breakdown {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            
            .category-item {
              margin-bottom: 20px;
            }
            
            .category-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            }
            
            .category-name {
              font-weight: 600;
              font-size: 16px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .category-stats {
              display: flex;
              gap: 15px;
              align-items: center;
            }
            
            .category-amount {
              font-weight: 700;
              font-size: 18px;
            }
            
            .category-percentage {
              background: #667eea;
              color: white;
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
            }
            
            .progress-bar {
              height: 10px;
              background: #e0e0e0;
              border-radius: 5px;
              overflow: hidden;
            }
            
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #667eea, #764ba2);
              border-radius: 5px;
              transition: width 0.5s ease;
            }
            
            .progress-fill.income {
              background: linear-gradient(90deg, #4CAF50, #66BB6A);
            }
            
            .progress-fill.expense {
              background: linear-gradient(90deg, #f44336, #ef5350);
            }
            
            .transactions-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              border-radius: 8px;
              overflow: hidden;
            }
            
            .transactions-table thead {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            
            .transactions-table thead.income-header {
              background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
            }
            
            .transactions-table thead.expense-header {
              background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
            }
            
            .transactions-table th {
              padding: 15px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .transactions-table td {
              padding: 15px;
              border-bottom: 1px solid #e0e0e0;
              font-size: 14px;
            }
            
            .transactions-table tbody tr:hover {
              background: #f8f9fa;
            }
            
            .transactions-table tbody tr:last-child td {
              border-bottom: none;
            }
            
            .amount-positive {
              color: #4CAF50;
              font-weight: 700;
            }
            
            .amount-negative {
              color: #f44336;
              font-weight: 700;
            }
            
            .total-row {
              background: #f8f9fa;
              font-weight: 700;
              font-size: 16px;
            }
            
            .total-row td {
              padding: 20px 15px;
              border-top: 2px solid #667eea;
            }
            
            .report-footer {
              background: #f8f9fa;
              padding: 30px;
              margin-top: 40px;
              border-radius: 10px;
              text-align: center;
            }
            
            .report-footer h3 {
              font-size: 20px;
              margin-bottom: 20px;
              color: #667eea;
            }
            
            .footer-summary {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 20px;
            }
            
            .footer-item {
              display: flex;
              justify-content: space-between;
              padding: 12px 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .footer-label {
              color: #666;
              font-weight: 500;
            }
            
            .footer-value {
              font-weight: 700;
              font-size: 16px;
            }
            
            .watermark {
              text-align: center;
              margin-top: 30px;
              color: #999;
              font-size: 13px;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .report-container {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="report-header">
              <h1> Financial Report</h1>
              <div class="period">${reportData.period}</div>
              <div class="generated-date">Generated on ${format(new Date(), 'MMMM dd, yyyy')} at ${format(new Date(), 'HH:mm:ss')}</div>
            </div>
            
            <div class="report-body">
              <div class="user-details">
                <div class="user-details-header">Account Holder</div>
                <table class="user-details-table">
                  <tr>
                    <td>Full Name</td>
                    <td>${user && user.name ? user.name : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>${user && user.email ? user.email : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Role</td>
                    <td>${user && user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Summary Cards -->
              <div class="summary-section">
                <div class="summary-card income">
                  <div class="label">Total Income</div>
                  <div class="value">₹${reportData.totalIncome.toFixed(2)}</div>
                  <div class="subtext">${reportData.incomeCount} transactions</div>
                </div>
                
                <div class="summary-card expense">
                  <div class="label">Total Expenses</div>
                  <div class="value">₹${reportData.totalExpenses.toFixed(2)}</div>
                  <div class="subtext">${reportData.expenseCount} transactions</div>
                </div>
                
                <div class="summary-card savings">
                  <div class="label">Net Savings</div>
                  <div class="value">₹${reportData.netSavings.toFixed(2)}</div>
                  <div class="subtext">Savings Rate: ${reportData.savingsRate}%</div>
                </div>
                
                <div class="summary-card average">
                  <div class="label">Daily Average</div>
                  <div class="value">₹${reportData.avgDailyExpense.toFixed(2)}</div>
                  <div class="subtext">Average daily expense</div>
                </div>
              </div>
              
              ${reportData.incomeCount > 0 ? `
              <!-- Income Section -->
              <h2 class="section-title income-section">💵 Income Breakdown</h2>
              
              <div class="category-breakdown">
                ${reportData.incomeCategoryBreakdown.map(cat => `
                  <div class="category-item">
                    <div class="category-header">
                      <div class="category-name">
                        <span>${getCategoryEmoji(cat.name)}</span>
                        <span>${cat.name}</span>
                      </div>
                      <div class="category-stats">
                        <span class="category-amount amount-positive">₹${cat.amount.toFixed(2)}</span>
                        <span class="category-percentage">${cat.percentage}%</span>
                      </div>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill income" style="width: ${cat.percentage}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #2e7d32;">Income Transactions (${reportData.incomeCount})</h3>
              <table class="transactions-table">
                <thead class="income-header">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.incomeTransactions.map(exp => `
                    <tr>
                      <td>${format(new Date(exp.date), 'dd MMM yyyy')}</td>
                      <td>
                        <strong>${exp.title}</strong>
                        ${exp.notes ? '<br><span style="font-size: 12px; color: #666;">' + exp.notes + '</span>' : ''}
                      </td>
                      <td>${getCategoryEmoji(exp.category)} ${exp.category || 'N/A'}</td>
                      <td class="amount-positive" style="text-align: right;">+₹${Math.abs(exp.amount).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Total Income:</td>
                    <td class="amount-positive" style="text-align: right;">₹${reportData.totalIncome.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              ` : ''}
              
              ${reportData.expenseCount > 0 ? `
              <!-- Expense Section -->
              <h2 class="section-title expense-section">💸 Expense Breakdown</h2>
              
              <div class="category-breakdown">
                ${reportData.categoryBreakdown.map(cat => `
                  <div class="category-item">
                    <div class="category-header">
                      <div class="category-name">
                        <span>${getCategoryEmoji(cat.name)}</span>
                        <span>${cat.name}</span>
                      </div>
                      <div class="category-stats">
                        <span class="category-amount amount-negative">₹${cat.amount.toFixed(2)}</span>
                        <span class="category-percentage">${cat.percentage}%</span>
                      </div>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill expense" style="width: ${cat.percentage}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #c62828;">Expense Transactions (${reportData.expenseCount})</h3>
              <table class="transactions-table">
                <thead class="expense-header">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.expenseTransactions.map(exp => `
                    <tr>
                      <td>${format(new Date(exp.date), 'dd MMM yyyy')}</td>
                      <td>
                        <strong>${exp.title}</strong>
                        ${exp.notes ? '<br><span style="font-size: 12px; color: #666;">' + exp.notes + '</span>' : ''}
                      </td>
                      <td>${getCategoryEmoji(exp.category)} ${exp.category || 'N/A'}</td>
                      <td class="amount-negative" style="text-align: right;">-₹${Math.abs(exp.amount).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Total Expenses:</td>
                    <td class="amount-negative" style="text-align: right;">₹${reportData.totalExpenses.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              ` : ''}
              
              <!-- Footer Summary -->
              <div class="report-footer">
                <h3>📊 Financial Summary</h3>
                <div class="footer-summary">
                  <div class="footer-item">
                    <span class="footer-label">Total Income:</span>
                    <span class="footer-value amount-positive">₹${reportData.totalIncome.toFixed(2)}</span>
                  </div>
                  <div class="footer-item">
                    <span class="footer-label">Total Expenses:</span>
                    <span class="footer-value amount-negative">₹${reportData.totalExpenses.toFixed(2)}</span>
                  </div>
                  <div class="footer-item">
                    <span class="footer-label">Net Savings:</span>
                    <span class="footer-value" style="color: ${reportData.netSavings >= 0 ? '#4CAF50' : '#f44336'};">₹${reportData.netSavings.toFixed(2)}</span>
                  </div>
                  <div class="footer-item">
                    <span class="footer-label">Savings Rate:</span>
                    <span class="footer-value" style="color: ${reportData.savingsRate >= 0 ? '#4CAF50' : '#f44336'};">${reportData.savingsRate}%</span>
                  </div>
                </div>
                
                <div class="watermark">
                  <p>Fast Budget - Your Personal Finance Tracker</p>
                  <p style="margin-top: 5px;">Keep tracking, keep saving! 💪</p>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = reportHTML;
    document.body.appendChild(tempContainer);

    // Configure PDF options
    const opt = {
      margin: 10,
      filename: `Financial-Report-${reportData.period.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    // Generate and download PDF
    html2pdf().from(tempContainer).set(opt).save().then(() => {
      document.body.removeChild(tempContainer);
      setDownloading(false);
      console.log('PDF downloaded successfully!');
    }).catch((err) => {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      setDownloading(false);
    });
  };

  const printReport = () => {
    if (!reportData) {
      alert('No report data available');
      return;
    }

    console.log('Generating report for printing:', reportData.period);

    const reportHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Print Report - ${reportData.period}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              padding: 20px;
              color: #333;
            }
            
            .report-container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
            }
            
            .report-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              text-align: center;
              margin-bottom: 30px;
            }
            
            .report-header h1 {
              font-size: 36px;
              margin-bottom: 10px;
              font-weight: 700;
            }
            
            .report-header .period {
              font-size: 20px;
              opacity: 0.95;
              font-weight: 400;
            }
            
            .report-header .generated-date {
              font-size: 14px;
              opacity: 0.85;
              margin-top: 10px;
            }
            
            .user-details {
              margin-bottom: 30px;
              padding: 20px 24px;
              border-radius: 10px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
            }
            
            .user-details-header {
              font-size: 16px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #4a5568;
              margin-bottom: 12px;
            }
            
            .user-details-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            }
            
            .user-details-table td {
              padding: 6px 0;
            }
            
            .user-details-table td:first-child {
              width: 150px;
              color: #718096;
              font-weight: 600;
            }
            
            .user-details-table td:last-child {
              color: #2d3748;
            }
            
            .summary-section {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin-bottom: 40px;
            }
            
            .summary-card {
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              padding: 25px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            
            .summary-card.income {
              background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
            }
            
            .summary-card.expense {
              background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            }
            
            .summary-card.savings {
              background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
              color: white;
            }
            
            .summary-card.average {
              background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            }
            
            .summary-card .label {
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
              opacity: 0.8;
            }
            
            .summary-card .value {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 5px;
            }
            
            .summary-card .subtext {
              font-size: 13px;
              opacity: 0.75;
            }
            
            .section-title {
              font-size: 24px;
              font-weight: 700;
              margin: 40px 0 20px 0;
              padding-bottom: 10px;
              border-bottom: 3px solid #667eea;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .section-title.income-section {
              border-bottom-color: #4CAF50;
              color: #2e7d32;
            }
            
            .section-title.expense-section {
              border-bottom-color: #f44336;
              color: #c62828;
            }
            
            .category-breakdown {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            
            .category-item {
              margin-bottom: 20px;
            }
            
            .category-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            }
            
            .category-name {
              font-weight: 600;
              font-size: 16px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .category-stats {
              display: flex;
              gap: 15px;
              align-items: center;
            }
            
            .category-amount {
              font-weight: 700;
              font-size: 18px;
            }
            
            .category-percentage {
              background: #667eea;
              color: white;
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
            }
            
            .progress-bar {
              height: 10px;
              background: #e0e0e0;
              border-radius: 5px;
              overflow: hidden;
            }
            
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #667eea, #764ba2);
              border-radius: 5px;
            }
            
            .progress-fill.income {
              background: linear-gradient(90deg, #4CAF50, #66BB6A);
            }
            
            .progress-fill.expense {
              background: linear-gradient(90deg, #f44336, #ef5350);
            }
            
            .transactions-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              border-radius: 8px;
              overflow: hidden;
            }
            
            .transactions-table thead {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            
            .transactions-table thead.income-header {
              background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
            }
            
            .transactions-table thead.expense-header {
              background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
            }
            
            .transactions-table th {
              padding: 15px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .transactions-table td {
              padding: 15px;
              border-bottom: 1px solid #e0e0e0;
              font-size: 14px;
            }
            
            .transactions-table tbody tr:hover {
              background: #f8f9fa;
            }
            
            .amount-positive {
              color: #4CAF50;
              font-weight: 700;
            }
            
            .amount-negative {
              color: #f44336;
              font-weight: 700;
            }
            
            .total-row {
              background: #f8f9fa;
              font-weight: 700;
              font-size: 16px;
            }
            
            .total-row td {
              padding: 20px 15px;
              border-top: 2px solid #667eea;
            }
            
            .report-footer {
              background: #f8f9fa;
              padding: 30px;
              margin-top: 40px;
              border-radius: 10px;
              text-align: center;
            }
            
            .report-footer h3 {
              font-size: 20px;
              margin-bottom: 20px;
              color: #667eea;
            }
            
            .footer-summary {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 20px;
            }
            
            .footer-item {
              display: flex;
              justify-content: space-between;
              padding: 12px 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .footer-label {
              color: #666;
              font-weight: 500;
            }
            
            .footer-value {
              font-weight: 700;
              font-size: 16px;
            }
            
            .watermark {
              text-align: center;
              margin-top: 30px;
              color: #999;
              font-size: 13px;
            }
            
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="report-header">
              <h1>💰 Financial Report</h1>
              <div class="period">${reportData.period}</div>
              <div class="generated-date">Generated on ${format(new Date(), 'MMMM dd, yyyy')} at ${format(new Date(), 'HH:mm:ss')}</div>
            </div>
            
            <div class="user-details">
              <div class="user-details-header">Account Holder</div>
              <table class="user-details-table">
                <tr>
                  <td>Full Name</td>
                  <td>${user && user.name ? user.name : 'N/A'}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>${user && user.email ? user.email : 'N/A'}</td>
                </tr>
                <tr>
                  <td>Role</td>
                  <td>${user && user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Summary Cards -->
            <div class="summary-section">
              <div class="summary-card income">
                <div class="label">Total Income</div>
                <div class="value">₹${reportData.totalIncome.toFixed(2)}</div>
                <div class="subtext">${reportData.incomeCount} transactions</div>
              </div>
              
              <div class="summary-card expense">
                <div class="label">Total Expenses</div>
                <div class="value">₹${reportData.totalExpenses.toFixed(2)}</div>
                <div class="subtext">${reportData.expenseCount} transactions</div>
              </div>
              
              <div class="summary-card savings">
                <div class="label">Net Savings</div>
                <div class="value">₹${reportData.netSavings.toFixed(2)}</div>
                <div class="subtext">Savings Rate: ${reportData.savingsRate}%</div>
              </div>
              
              <div class="summary-card average">
                <div class="label">Daily Average</div>
                <div class="value">₹${reportData.avgDailyExpense.toFixed(2)}</div>
                <div class="subtext">Average daily expense</div>
              </div>
            </div>
            
            ${reportData.incomeCount > 0 ? `
            <!-- Income Section -->
            <h2 class="section-title income-section">💵 Income Breakdown</h2>
            
            <div class="category-breakdown">
              ${reportData.incomeCategoryBreakdown.map(cat => `
                <div class="category-item">
                  <div class="category-header">
                    <div class="category-name">
                      <span>${getCategoryEmoji(cat.name)}</span>
                      <span>${cat.name}</span>
                    </div>
                    <div class="category-stats">
                      <span class="category-amount amount-positive">₹${cat.amount.toFixed(2)}</span>
                      <span class="category-percentage">${cat.percentage}%</span>
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill income" style="width: ${cat.percentage}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #2e7d32;">Income Transactions (${reportData.incomeCount})</h3>
            <table class="transactions-table">
              <thead class="income-header">
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.incomeTransactions.map(exp => `
                  <tr>
                    <td>${format(new Date(exp.date), 'dd MMM yyyy')}</td>
                    <td>
                      <strong>${exp.title}</strong>
                      ${exp.notes ? '<br><span style="font-size: 12px; color: #666;">' + exp.notes + '</span>' : ''}
                    </td>
                    <td>${getCategoryEmoji(exp.category)} ${exp.category || 'N/A'}</td>
                    <td class="amount-positive" style="text-align: right;">+₹${Math.abs(exp.amount).toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Total Income:</td>
                  <td class="amount-positive" style="text-align: right;">₹${reportData.totalIncome.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            ` : ''}
            
            ${reportData.expenseCount > 0 ? `
            <!-- Expense Section -->
            <h2 class="section-title expense-section">💸 Expense Breakdown</h2>
            
            <div class="category-breakdown">
              ${reportData.categoryBreakdown.map(cat => `
                <div class="category-item">
                  <div class="category-header">
                    <div class="category-name">
                      <span>${getCategoryEmoji(cat.name)}</span>
                      <span>${cat.name}</span>
                    </div>
                    <div class="category-stats">
                      <span class="category-amount amount-negative">₹${cat.amount.toFixed(2)}</span>
                      <span class="category-percentage">${cat.percentage}%</span>
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill expense" style="width: ${cat.percentage}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #c62828;">Expense Transactions (${reportData.expenseCount})</h3>
            <table class="transactions-table">
              <thead class="expense-header">
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.expenseTransactions.map(exp => `
                  <tr>
                    <td>${format(new Date(exp.date), 'dd MMM yyyy')}</td>
                    <td>
                      <strong>${exp.title}</strong>
                      ${exp.notes ? '<br><span style="font-size: 12px; color: #666;">' + exp.notes + '</span>' : ''}
                    </td>
                    <td>${getCategoryEmoji(exp.category)} ${exp.category || 'N/A'}</td>
                    <td class="amount-negative" style="text-align: right;">-₹${Math.abs(exp.amount).toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Total Expenses:</td>
                  <td class="amount-negative" style="text-align: right;">₹${reportData.totalExpenses.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            ` : ''}
            
            <!-- Footer Summary -->
            <div class="report-footer">
              <h3>📊 Financial Summary</h3>
              <div class="footer-summary">
                <div class="footer-item">
                  <span class="footer-label">Total Income:</span>
                  <span class="footer-value amount-positive">₹${reportData.totalIncome.toFixed(2)}</span>
                </div>
                <div class="footer-item">
                  <span class="footer-label">Total Expenses:</span>
                  <span class="footer-value amount-negative">₹${reportData.totalExpenses.toFixed(2)}</span>
                </div>
                <div class="footer-item">
                  <span class="footer-label">Net Savings:</span>
                  <span class="footer-value" style="color: ${reportData.netSavings >= 0 ? '#4CAF50' : '#f44336'};">₹${reportData.netSavings.toFixed(2)}</span>
                </div>
                <div class="footer-item">
                  <span class="footer-label">Savings Rate:</span>
                  <span class="footer-value" style="color: ${reportData.savingsRate >= 0 ? '#4CAF50' : '#f44336'};">₹${reportData.savingsRate}%</span>
                </div>
              </div>
              
              <div class="watermark">
                <p>Fast Budget - Your Personal Finance Tracker</p>
                <p style="margin-top: 5px;">Keep tracking, keep saving! 💪</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

    // Open in new window and print
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    } else {
      alert('Please allow pop-ups to print the report');
    }
  };

  return (
    <div className="report-generator">
      <div className="report-header">
        <button className="back-button" onClick={onClose}>
          <span>←</span> Back
        </button>
        <h2>Generate Report</h2>
      </div>

      <div className="report-controls">
        <div className="report-type-selector">
          <button
            className={`report-type-btn ${reportType === 'monthly' ? 'active' : ''}`}
            onClick={() => setReportType('monthly')}
          >
            Monthly
          </button>
          <button
            className={`report-type-btn ${reportType === 'yearly' ? 'active' : ''}`}
            onClick={() => setReportType('yearly')}
          >
            Yearly
          </button>
        </div>

        <div className="date-picker">
          <input
            type={reportType === 'monthly' ? 'month' : 'number'}
            value={reportType === 'monthly' 
              ? format(selectedDate, 'yyyy-MM')
              : format(selectedDate, 'yyyy')
            }
            onChange={(e) => {
              if (reportType === 'monthly') {
                const [year, month] = e.target.value.split('-');
                setSelectedDate(new Date(year, month - 1, 1));
              } else {
                setSelectedDate(new Date(e.target.value, 0, 1));
              }
            }}
            className="date-input"
          />
        </div>

        <div className="report-actions">
          <button className="btn-primary" onClick={downloadReport} disabled={!reportData || downloading}>
            {downloading ? '⏳ Generating PDF...' : '📥 Download'}
          </button>
          <button className="btn-secondary" onClick={printReport} disabled={!reportData}>
            🖨️ Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="report-loading">Loading report data...</div>
      ) : reportData ? (
        <div className="report-content" id="printable-report">
          <div className="report-summary">
            <h3>Summary - {reportData.period}</h3>
            <div className="summary-grid">
              <div className="summary-item income">
                <span className="summary-label">Total Income</span>
                <span className="summary-value">₹{reportData.totalIncome.toFixed(2)}</span>
                <span className="summary-count">{reportData.incomeCount} transactions</span>
              </div>
              <div className="summary-item expense">
                <span className="summary-label">Total Expenses</span>
                <span className="summary-value">₹{reportData.totalExpenses.toFixed(2)}</span>
                <span className="summary-count">{reportData.expenseCount} transactions</span>
              </div>
              <div className="summary-item savings">
                <span className="summary-label">Net Savings</span>
                <span className="summary-value">₹{reportData.netSavings.toFixed(2)}</span>
                <span className="summary-count">Savings Rate: {reportData.savingsRate}%</span>
              </div>
              <div className="summary-item avg">
                <span className="summary-label">Avg Daily Expense</span>
                <span className="summary-value">₹{reportData.avgDailyExpense.toFixed(2)}</span>
                <span className="summary-count">Per day average</span>
              </div>
            </div>
          </div>

          {reportData.incomeCount > 0 && (
            <div className="report-category-breakdown income-section">
              <h3>💵 Income Breakdown</h3>
              <div className="category-list">
                {reportData.incomeCategoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="category-item">
                    <div className="category-info">
                      <span className="category-emoji">{getCategoryEmoji(cat.name)}</span>
                      <span className="category-name">{cat.name}</span>
                    </div>
                    <div className="category-stats">
                      <span className="category-amount income">₹{cat.amount.toFixed(2)}</span>
                      <span className="category-percentage">{cat.percentage}%</span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-bar-fill income" 
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportData.expenseCount > 0 && (
            <div className="report-category-breakdown expense-section">
              <h3>💸 Expense Breakdown</h3>
              <div className="category-list">
                {reportData.categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="category-item">
                    <div className="category-info">
                      <span className="category-emoji">{getCategoryEmoji(cat.name)}</span>
                      <span className="category-name">{cat.name}</span>
                    </div>
                    <div className="category-stats">
                      <span className="category-amount expense">₹{cat.amount.toFixed(2)}</span>
                      <span className="category-percentage">{cat.percentage}%</span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-bar-fill expense" 
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportData.incomeCount > 0 && (
            <div className="report-transactions income-transactions">
              <h3>Income Transactions ({reportData.incomeCount})</h3>
              <div className="transactions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.incomeTransactions.slice(0, 20).map((exp, idx) => (
                      <tr key={idx}>
                        <td>{format(new Date(exp.date), 'MMM dd, yyyy')}</td>
                        <td>{exp.title}</td>
                        <td>
                          <span className="category-badge">
                            {getCategoryEmoji(exp.category)} {exp.category || 'N/A'}
                          </span>
                        </td>
                        <td className="positive">
                          +₹{Math.abs(exp.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportData.expenseCount > 0 && (
            <div className="report-transactions expense-transactions">
              <h3>Expense Transactions ({reportData.expenseCount})</h3>
              <div className="transactions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.expenseTransactions.slice(0, 20).map((exp, idx) => (
                      <tr key={idx}>
                        <td>{format(new Date(exp.date), 'MMM dd, yyyy')}</td>
                        <td>{exp.title}</td>
                        <td>
                          <span className="category-badge">
                            {getCategoryEmoji(exp.category)} {exp.category || 'N/A'}
                          </span>
                        </td>
                        <td className="negative">
                          -₹{Math.abs(exp.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="report-empty">No data available for the selected period</div>
      )}
    </div>
  );
}
