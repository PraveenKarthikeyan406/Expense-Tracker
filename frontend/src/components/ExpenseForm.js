import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { createExpense, updateExpense } from '../services/expenses';

const ExpenseForm = ({ date, token, onClose, onSave: onExpenseAdded, editing }) => {
  const [title, setTitle] = useState(editing?.title || '');
  const [amount, setAmount] = useState(editing ? String(Math.abs(editing.amount)) : '');
  const [category, setCategory] = useState(editing?.category || 'food');
  const [type, setType] = useState(editing ? (editing.amount < 0 ? 'spend' : 'earn') : 'spend'); // 'spend' or 'earn'
  const [note, setNote] = useState(editing?.notes || '');

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '');
      setAmount(String(Math.abs(editing.amount ?? '')));
      setCategory(editing.category || 'food');
      setType(editing.amount < 0 ? 'spend' : 'earn');
      setNote(editing.notes || '');
    }
  }, [editing]);

  const spendCategories = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'health', label: 'Health & Medical' },
    { value: 'housing', label: 'Housing & Rent' },
    { value: 'travel', label: 'Travel' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other Expenses' }
  ];

  const earnCategories = [
    { value: 'salary', label: 'Salary & Wages' },
    { value: 'freelance', label: 'Freelance & Contract' },
    { value: 'investment', label: 'Investment Income' },
    { value: 'gift', label: 'Gifts Received' },
    { value: 'refund', label: 'Refunds' },
    { value: 'other', label: 'Other Income' }
  ];

  function setDefaultCategoryForType(nextType){
    if (nextType === 'earn') {
      const earnKeys = new Set(earnCategories.map(c => c.value));
      setCategory(prev => earnKeys.has(prev) ? prev : 'salary');
    } else {
      const spendKeys = new Set(spendCategories.map(c => c.value));
      setCategory(prev => spendKeys.has(prev) ? prev : 'food');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !amount) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const finalAmount = type === 'spend' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));
      const payload = {
        title,
        amount: finalAmount,
        category,
        notes: note,
        date: format(editing?.date ? new Date(editing.date) : date, 'yyyy-MM-dd')
      };

      if (editing?._id) {
        await updateExpense(token, editing._id, payload);
      } else {
        await createExpense(token, payload);
      }

      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to save expense: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="expense-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editing ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="date-display">
          {format(editing?.date ? new Date(editing.date) : date, 'MMMM d, yyyy')}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="transaction-type-selector">
            <button 
              type="button" 
              className={`type-btn spend ${type === 'spend' ? 'active' : ''}`}
              onClick={() => { setType('spend'); setDefaultCategoryForType('spend'); }}
            >
              Expense
            </button>
            <button 
              type="button" 
              className={`type-btn earn ${type === 'earn' ? 'active' : ''}`}
              onClick={() => { setType('earn'); setDefaultCategoryForType('earn'); }}
            >
              Income
            </button>
          </div>
          
          <div className="input-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className={type === 'spend' ? 'expense-input' : 'income-input'}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="amount">Amount</label>
            <div className="amount-input-container">
              <span className={`amount-symbol ${type === 'spend' ? 'expense' : 'income'}`}>
                {type === 'spend' ? '-₹' : '+₹'}
              </span>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                step="0.01"
                min="0"
                required
                className={type === 'spend' ? 'expense-input' : 'income-input'}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className={type === 'spend' ? 'expense-select' : 'income-select'}
            >
              {type === 'spend' 
                ? spendCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))
                : earnCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))
              }
            </select>
          </div>
          
          <div className="input-group">
            <label htmlFor="note">Note (Optional)</label>
            <textarea
              id="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;