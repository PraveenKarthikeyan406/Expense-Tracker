Full project structure:

/backend
  - package.json
  - index.js
  - .env.example
  - models/User.js
  - models/Expense.js
  - middleware/auth.js
  - routes/auth.js
  - routes/expenses.js

/frontend
  - package.json
  - src/
    - index.js
    - App.js
    - styles.css
    - components/ (AuthModal, CalendarView, ExpensesForDay, AddExpenseModal)
    - services/ (auth.js, expenses.js)

How to run locally:
1. Backend:
   - cd backend
   - npm install
   - copy .env.example -> .env and set MONGO_URI and JWT_SECRET
   - npm run dev

2. Frontend:
   - create-react-app frontend (or use existing)
   - replace package.json and src/ with the provided files
   - set REACT_APP_API in frontend/.env to http://localhost:5000
   - npm install
   - npm start

Notes:
- The backend returns user info at GET /api/auth/me when provided with Authorization: Bearer <token>.
- The frontend expects that endpoint to exist.
- Adjust CORS or deployment settings as needed.
