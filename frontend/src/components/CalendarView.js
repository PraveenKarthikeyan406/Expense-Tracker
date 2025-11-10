import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import ExpensesForDay from './ExpensesForDay';
import { fetchExpenses } from '../services/expenses';
import ExpenseForm from './ExpenseForm';

export default function CalendarView({ token, user }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  useEffect(()=> {
    async function loadMonthExpenses(){
      if(!token) { setExpenses([]); return; }
      const start = startOfMonth(currentMonth).toISOString();
      const end = endOfMonth(currentMonth).toISOString();
      const res = await fetchExpenses(token, { startDate: start, endDate: end });
      setExpenses(res);
    }
    loadMonthExpenses();
  }, [currentMonth, token]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); 

  const rows = [];
  let day = startDate;
  for(let i=0;i<6;i++){
    const days = [];
    for(let j=0;j<7;j++){
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    rows.push(days);
  }

  function totalForDate(d){
    return expenses.filter(e => isSameDay(new Date(e.date), d)).reduce((s,e)=> s + e.amount, 0);
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const refreshExpenses = async () => {
    if(!token) return;
    const start = startOfMonth(currentMonth).toISOString();
    const end = endOfMonth(currentMonth).toISOString();
    const res = await fetchExpenses(token, { startDate: start, endDate: end });
    setExpenses(res);
  };

  return (
    <div className="dashboard-layout">
      <div className="expenses-section">
        <div className="expenses-header">
          <h2>Expenses for {format(selectedDate, 'MMMM d, yyyy')}</h2>
          <button className="add-expense-btn" onClick={() => setShowExpenseForm(true)}>
            Add Expense
          </button>
        </div>
        <ExpensesForDay 
          date={selectedDate} 
          expenses={expenses.filter(e => isSameDay(new Date(e.date), selectedDate))} 
          token={token} 
          refresh={refreshExpenses} 
        />
      </div>
      
      <div className="calendar-section">
        <div className="cal-header">
          <button
            className="month-nav-btn prev"
            aria-label="Previous month"
            onClick={()=>setCurrentMonth(addDays(currentMonth, -30))}
            title="Previous month"
          >
            <svg className="arrow-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
          </button>
          <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
          <button
            className="month-nav-btn next"
            aria-label="Next month"
            onClick={()=>setCurrentMonth(addDays(currentMonth, 30))}
            title="Next month"
          >
            <svg className="arrow-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z"></path>
            </svg>
          </button>
        </div>

        <div className="calendar-grid">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=> <div key={d} className="cal-weekday">{d}</div>)}
          {rows.flat().map((d, idx) => (
            <div 
              key={idx} 
              onClick={()=>setSelectedDate(d)} 
              className={`cal-cell ${isSameMonth(d, monthStart)?'in-month':'out-month'} ${isSameDay(d, selectedDate)?'selected':''}`}
            >
              <div className="cell-date">{format(d,'d')}</div>
              <div className="cell-total">
                {expenses.some(e => isSameDay(new Date(e.date), d)) && (
                  <span className={totalForDate(d) >= 0 ? 'income-amount' : 'expense-amount'}>
                    {totalForDate(d) >= 0 ? '+' : '-'}₹{Math.abs(totalForDate(d))}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showExpenseForm && (
        <ExpenseForm 
          date={selectedDate} 
          token={token} 
          onClose={() => setShowExpenseForm(false)} 
          onSave={() => {
            setShowExpenseForm(false);
            refreshExpenses();
          }} 
        />
      )}
    </div>
  );
}
