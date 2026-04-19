# SpendWise - Personal Expense Tracker

A modern, elegant expense tracking application built with React, Firebase, and Tailwind CSS.

## Features

### Core Functionality
- **Expense Tracking** - Add, view, and delete expenses with categories
- **Analytics Dashboard** - Visualize spending patterns with detailed insights
- **Cloud Sync** - Real-time synchronization across devices via Firebase
- **Secure Authentication** - Email/password authentication with password reset

### Pages & Routes
| Route | Description | Access |
|------|-------------|--------|
| `/` | Landing page (logged out) or Home (logged in) | Public/Protected |
| `/login` | Authentication form | Public only |
| `/analytics` | Spending analytics dashboard | Protected |

### User Flows

#### Authentication
1. **Register**: Enter email + password → Account created → Auto-login
2. **Login**: Enter credentials → Access granted
3. **Logout**: Click logout → All state cleared → Redirect to login
4. **Password Reset**: Enter email → Reset link sent via Firebase

#### Expense Management
1. Add expense: Fill form → Submit → Real-time sync
2. View expenses: Scrollable list sorted by date
3. Delete expense: Hover → Click trash icon → Removed from Firestore

### Technology Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Backend**: Firebase (Auth + Firestore)
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Project Structure

```
src/
├── api/
│   └── firebase.js       # Firebase configuration
├── components/
│   ├── Analytics.jsx    # Analytics charts
│   ├── AuthForm.jsx     # Login/Register/Reset form
│   ├── ErrorBanner.jsx # Error display
│   ├── ExpenseForm.jsx # Add expense form
│   ├── ExpenseList.jsx  # Expense list
│   ├── Header.jsx       # App header
│   ├── StatusBar.jsx    # Sync status indicator
│   └── Summary.jsx      # Total display
├── hooks/
│   └── useErrorBoundary.jsx  # Error boundary
├── pages/
│   ├── AnalyticsPage.jsx   # Analytics route
│   ├── HomePage.jsx      # Home/Ledger route
│   └── LandingPage.jsx    # Landing page
├── store/
│   └── useStore.js       # Zustand store
├── utils/
│   ├── constants.js      # App constants
│   └── formatters.js    # Number formatters
├── App.jsx              # Main app with routing
└── main.jsx             # Entry point
```

### State Management (Zustand)

```javascript
const store = create((set, get) => ({
  user: null,              // Current user
  activeUserId: null,      // Active user ID for listeners
  expenses: [],           // Expense array
  isSyncing: false,       // Loading state
  errorMsg: null,        // Error message
  authInitialized: false, // Auth ready flag
  
  // Actions
  setUser, setError, setSyncing,
  initAuth, fetchExpenses,
  addExpense, deleteExpense,
  login, register, resetPassword, logout
}));
```

### Firebase Data Model

```
artifacts/
└── [app-id]/
    └── users/
        └── [user-id]/
            └── expenses/
                └── [expense-id]/
                    ├── description: string
                    ├── amount: number
                    ├── category: string
                    ├── date: string (ISO)
                    └── createdAt: timestamp
```

### Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### Development Commands

```bash
npm run dev    # Start development server
npm run lint   # Run ESLint
npm run build  # Build for production
```

### Design System

**Colors**:
- Primary: Stone-900 (#1c1917)
- Background: #FBFBF9
- Accent: Stone-50 to Stone-900 gradients

**Typography**:
- Headings: Serif, italic
- Body: Sans-serif
- Sizes: 10px-60px

**Animations**:
- Transitions: 500ms duration
- Loading: Spinner animation

### Security Considerations

- Email/password authentication via Firebase Auth
- Firestore security rules restrict data to owner only
- No sensitive data in localStorage
- HTTPS required for production

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- React 19 compatible

### Known Limitations

- Bundle size > 500KB - consider code splitting
- No offline support (requires internet)
- Single device at a time (no multi-tab sync)
- No export/import functionality

### Future Enhancements

- [ ] Export to CSV/Excel
- [ ] Recurring expenses
- [ ] Budget alerts
- [ ] Multi-currency support
- [ ] Dark mode
- [ ] PWA support
- [ ] Offline support
- [ ] Charts/graphs in Analytics

---

**Author**: SpendWise Team  
**Version**: 1.0.0  
**License**: Private