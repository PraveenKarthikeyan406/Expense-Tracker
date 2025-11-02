import React, { useState, useEffect } from 'react';
import { fetchExpenses } from '../services/expenses';
import { getCategoryEmoji } from './categoryIcons';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
  differenceInCalendarWeeks
} from 'date-fns';

export default function ProfileView({ user, token }) {
  const [expenses, setExpenses] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    async function loadExpenses() {
      if (!token) return;
      
      let startDate, endDate;
      
      if (selectedPeriod === 'week') {
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
      } else if (selectedPeriod === 'month') {
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
      } else if (selectedPeriod === 'year') {
        startDate = new Date(selectedDate.getFullYear(), 0, 1);
        endDate = new Date(selectedDate.getFullYear(), 11, 31);
      } 
      
      const res = await fetchExpenses(token, { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      });
      
      setExpenses(res);
    }
    
    loadExpenses();
  }, [token, selectedPeriod, selectedDate]);

  const calculateTotals = () => {
    const categories = {};
    let totalSpend = 0;
    let totalEarn = 0;

    expenses.forEach(expense => {
      const amount = expense.amount;
      const category = expense.category || 'Uncategorized';

      if (amount < 0) {
        const val = Math.abs(amount);
        totalSpend += val;
        categories[category] = (categories[category] || 0) + val;
      } else {
        totalEarn += amount;
      }
    });

    return { categories, totalSpend, totalEarn };
  };

  const { categories, totalSpend, totalEarn } = calculateTotals();

  const generatePieChart = () => {
    if (totalSpend <= 0) return [];
    const colors = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    const entries = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    let cumulativePercent = 0;
    const segments = entries.map((entry, index) => {
      const percent = (entry.value / totalSpend) * 100;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;
      return {
        name: entry.name,
        value: entry.value,
        percent,
        color: colors[index % colors.length],
        startPercent,
        endPercent: cumulativePercent
      };
    });

    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      last.endPercent = 100;
      last.percent = 100 - last.startPercent;
    }

    return segments;
  };

  const pieChartData = generatePieChart();

  const [animatePie, setAnimatePie] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });

  useEffect(() => {
    const t = setTimeout(() => setAnimatePie(true), 50);
    return () => clearTimeout(t);
  }, [selectedPeriod, selectedDate, expenses.length]);

  function polarToCartesian(cx, cy, r, percent){
    const angle = (percent / 100) * 360 - 90; 
    const rad = (Math.PI / 180) * angle;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  function describeArc(cx, cy, r, startPercent, endPercent){
    const start = polarToCartesian(cx, cy, r, endPercent);
    const end = polarToCartesian(cx, cy, r, startPercent);
    const largeArcFlag = endPercent - startPercent <= 50 ? '0' : '1';
    return [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      'Z'
    ].join(' ');
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Financial Overview</h2>
        <div className="period-selector">
          <button 
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('year')}
          >
            Year
          </button>
        </div>
        <div className="date-selector">
          <button
            className="month-nav-btn prev"
            aria-label="Previous period"
            title="Previous"
            onClick={() => setSelectedDate(prev => (
              selectedPeriod === 'week' ? subWeeks(prev, 1) : selectedPeriod === 'month' ? subMonths(prev, 1) : subYears(prev, 1)
            ))}
          >
            <svg className="arrow-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
          </button>
          <span>{selectedPeriod === 'week' 
            ? `${format(selectedDate, 'MMMM')} (Week ${differenceInCalendarWeeks(selectedDate, startOfMonth(selectedDate), { weekStartsOn: 1 }) + 1})`
            : selectedPeriod === 'month' 
              ? format(selectedDate, 'MMMM yyyy') 
              : format(selectedDate, 'yyyy')
          }</span>
          <button
            className="month-nav-btn next"
            aria-label="Next period"
            title="Next"
            onClick={() => setSelectedDate(prev => (
              selectedPeriod === 'week' ? addWeeks(prev, 1) : selectedPeriod === 'month' ? addMonths(prev, 1) : addYears(prev, 1)
            ))}
          >
            <svg className="arrow-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card income">
          <h3>Income</h3>
          <p className="amount">+₹{totalEarn.toFixed(2)}</p>
        </div>
        <div className="summary-card expenses">
          <h3>Expenses</h3>
          <p className="amount">-₹{totalSpend.toFixed(2)}</p>
        </div>
        <div className="summary-card balance">
          <h3>Balance</h3>
          <p className="amount">₹{(totalEarn - totalSpend).toFixed(2)}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="pie-chart-container">
          <h3>Spending by Category</h3>
          <div className="pie-chart">
            <svg 
              viewBox="0 0 100 100" 
              className="pie" 
              role="img" 
              aria-label="Spending by Category"
              onMouseLeave={() => { setHoverIndex(null); setTooltip(t => ({ ...t, visible: false })); }}
            >
              {pieChartData.length > 0 ? (
                pieChartData.map((segment, i) => (
                  <circle
                    key={i}
                    r={25}
                    cx={50}
                    cy={50}
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth={hoverIndex === i ? 54 : 50}
                    strokeDasharray={`${animatePie ? segment.percent : 0} ${100 - segment.percent}`}
                    strokeDashoffset={`${100 - (animatePie ? segment.startPercent : 0)}`}
                    className={`pie-segment ${hoverIndex === i ? 'hovered' : ''}`}
                    onMouseEnter={(e) => {
                      setHoverIndex(i);
                      const pct = segment.percent.toFixed(1);
                      const amt = segment.value.toFixed(0);
                      setTooltip({ visible: true, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, text: `${segment.name}: ₹${amt} (${pct}%)` });
                    }}
                    onMouseMove={(e) => {
                      if (!tooltip.visible) return;
                      setTooltip(t => ({ ...t, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }));
                    }}
                  />
                ))
              ) : (
                <text x="50" y="50" textAnchor="middle" dy=".3em" fontSize="5">
                  No data
                </text>
              )}
            </svg>
            {tooltip.visible && (
              <div 
                className="pie-tooltip"
                style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
              >
                {tooltip.text}
              </div>
            )}
          </div>
          <div className="pie-legend">
            {pieChartData.map((segment, i) => (
              <div key={i} className="legend-item">
                <span className="color-box" style={{ backgroundColor: segment.color }}></span>
                <span className="category-name">{getCategoryEmoji(segment.name)} {segment.name}</span>
                <span className="category-percent">{segment.percent.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="expense-list">
          <h3>Recent Transactions</h3>
          {expenses.length > 0 ? (
            <div className="transactions">
              {expenses.map((expense, index) => (
                <div key={index} className={`transaction-item ${expense.amount < 0 ? 'expense' : 'income'}`}>
                  <div className="transaction-details">
                    <p className="transaction-title">
                      <span className="category-emoji" aria-hidden="true" style={{ marginRight: '6px' }}>
                        {getCategoryEmoji(expense.category)}
                      </span>
                      {expense.title}
                    </p>
                    <p className="transaction-date">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                    {(expense.notes || expense.note) && (
                      <p className="transaction-note">
                        <span className="note-label">Note:</span> {expense.notes || expense.note}
                      </p>
                    )}
                  </div>
                  <p className="transaction-amount">
                    {expense.amount < 0 ? '-' : '+'}₹{Math.abs(expense.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No transactions found for this period</p>
          )}
        </div>
      </div>
    </div>
  );
}