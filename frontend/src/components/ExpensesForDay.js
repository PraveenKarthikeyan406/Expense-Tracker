import React, { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import { getCategoryEmoji } from './categoryIcons';
import { deleteExpense } from '../services/expenses';
import { format } from 'date-fns';

export default function ExpensesForDay({ date, expenses, token, refresh }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function handleDelete(id){
    if(!confirm('Delete expense?')) return;
    await deleteExpense(token, id);
    refresh();
  }

  return (
    <div className="expenses-day">
      <div className="day-header">
        <h3>{format(date, 'PPP')}</h3>
      </div>

      <div className="expenses-list">
        {expenses.length === 0 && <div className="empty">No expenses</div>}
        {expenses.map(e => (
          <div className="expense-item" key={e._id}>
            <div>
              <div className="expense-title">{e.title}</div>
              <div className="expense-cat">
                <span className="category-emoji" aria-hidden="true">{getCategoryEmoji(e.category)}</span>
                <span className="category-text">{e.category || 'Uncategorized'}</span>
              </div>
              {(e.notes || e.note) && (
                <div className="expense-note">
                  <span className="note-label">Note:</span> {e.notes || e.note}
                </div>
              )}
            </div>
            <div className="expense-right">
              <div className="expense-amount">₹{e.amount}</div>
              <div className="expense-actions">
                <button
                  className="action-btn edit-btn"
                  aria-label="Edit expense"
                  title="Edit"
                  onClick={()=>{ setEditing(e); setOpen(true); }}
                >
                  <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
                  </svg>
                  <span>Edit</span>
                </button>
                <button
                  className="action-btn delete-btn"
                  aria-label="Delete expense"
                  title="Delete"
                  onClick={()=>handleDelete(e._id)}
                >
                  <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1z"/>
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && editing && (
        <ExpenseForm
          token={token}
          date={date}
          editing={editing}
          onClose={() => { setOpen(false); refresh(); }}
          onSave={() => { refresh(); }}
        />
      )}
    </div>
  );
}
