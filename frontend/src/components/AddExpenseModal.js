import React, { useState, useEffect } from 'react';
import { createExpense, updateExpense } from '../services/expenses';
import formatISO from 'date-fns/formatISO';

export default function AddExpenseModal({ token, date, editing, onClose }) {
  const [title, setTitle] = useState(editing?.title || '');
  const [amount, setAmount] = useState(editing?.amount || '');
  const [category, setCategory] = useState(editing?.category || '');
  const [notes, setNotes] = useState(editing?.notes || '');
  const [d, setD] = useState(editing ? formatISO(new Date(editing.date), { representation: 'date' }) : formatISO(date, { representation: 'date' }));

  useEffect(()=> {
    if(editing){
      setTitle(editing.title);
      setAmount(editing.amount);
      setCategory(editing.category);
      setNotes(editing.notes);
      setD(formatISO(new Date(editing.date), { representation: 'date' }));
    }
  }, [editing]);

  async function handleSubmit(e){
    e.preventDefault();
    const payload = { title, amount: Number(amount), category, notes, date: new Date(d).toISOString() };
    try {
      if(editing) await updateExpense(token, editing._id, payload);
      else await createExpense(token, payload);
      onClose();
    } catch (err) {
      alert('Error saving');
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{editing ? 'Edit Expense' : 'Add Expense'}</h3>
        <form onSubmit={handleSubmit}>
          <input required placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <input required placeholder="Amount" type="number" value={amount} onChange={e=>setAmount(e.target.value)} />
          <input placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
          <input type="date" value={d} onChange={e=>setD(e.target.value)} />
          <textarea placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} />
          <div className="modal-actions">
            <button type="submit">Save</button>
            <button type="button" className="link" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
