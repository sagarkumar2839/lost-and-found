# Fig & Thread — Lost & Found Portal (Frontend)

A React frontend for a MERN Lost & Found portal.

## Stack
- React (Create React App)
- React Router v6
- Axios (pre-wired for your Express API)
- lucide-react (icons)
- Plain CSS with a design-token system (no framework dependency)

## Getting started

```bash
npm install
npm start
```

Runs at http://localhost:3000. The app currently runs on **mock data** (see below) so you can develop and demo the UI before your backend is ready.

## Connecting to your real Express/MongoDB backend

Right now, all data operations go through `src/api/mockService.js`, which simulates:
- `authService` — register, login, logout, getCurrentUser
- `itemService` — getAll (with filters), getById, getMine, create, updateStatus, remove, submitClaim

To connect the real backend:

1. Create a `.env` file in the project root:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
2. `src/api/axiosInstance.js` is already configured to attach the JWT from `localStorage` to every request and to handle 401s.
3. Replace the calls in `mockService.js` (or create a parallel `realService.js`) with axios calls to your Express routes, e.g.:
   ```js
   // itemService.getAll
   const { data } = await axiosInstance.get("/items", { params: filters });
   return data;
   ```
4. Swap the import in `AuthContext.js`, `Browse.jsx`, `Home.jsx`, `ItemDetail.jsx`, `PostItem.jsx`, and `Dashboard.jsx` from `mockService` to your real service — the function signatures already match, so no other code should need to change.
5. For image uploads, `PostItem.jsx` currently reads the file into a base64 preview via `FileReader`. Swap this for a `FormData` upload to your `/api/items` endpoint (with Multer + Cloudinary/S3 on the backend) when ready.

## Suggested Express routes this frontend expects

```
POST   /api/auth/register        { name, email, password }
POST   /api/auth/login           { email, password }

GET    /api/items                ?q=&type=&category=
GET    /api/items/:id
GET    /api/items/mine           (auth required)
POST   /api/items                (auth required)
PATCH  /api/items/:id/status     { status }  (auth required)
DELETE /api/items/:id            (auth required)
POST   /api/items/:id/claim      { message }  (auth required)
```

## Project structure

```
src/
├── api/
│   ├── axiosInstance.js   # configured axios client w/ JWT interceptor
│   └── mockService.js     # mock data layer — swap for real API calls
├── components/
│   ├── Navbar.jsx / .css
│   ├── Footer.jsx / .css
│   ├── ItemCard.jsx / .css
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.js     # global auth state
├── pages/
│   ├── Home.jsx           # hero, stats, how-it-works, recent listings
│   ├── Browse.jsx         # search + filter + grid
│   ├── ItemDetail.jsx     # full item view + claim form
│   ├── PostItem.jsx       # lost/found submission form
│   ├── Login.jsx / Register.jsx
│   ├── Dashboard.jsx      # "My posts" — resolve/delete
│   └── NotFound.jsx
├── styles/
│   ├── tokens.css         # colors, type, spacing design tokens
│   └── components.css     # shared button/form/card/tag styles
├── App.js                 # routes
└── index.js
```

## Design notes

The visual identity ("Fig & Thread") treats the site like a community notice board rather than a generic SaaS dashboard: a serif display face (Lora) for headlines, warm paper background, and a clear color split between **lost** (amber/terracotta) and **found** (moss green) that's used consistently across tags, buttons, and stats.
