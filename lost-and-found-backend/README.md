# Lost & Found Portal — Backend

Express + MongoDB API for the Fig & Thread Lost & Found frontend. Built to match the exact route contract the React frontend already expects, so connecting them requires no changes to either side's core logic.

## Stack
- Express 5
- MongoDB + Mongoose
- JWT authentication (jsonwebtoken)
- bcryptjs for password hashing
- Multer for image uploads (stored locally in `/uploads`)
- CORS configured for the React dev server

## 1. Install dependencies

```bash
cd server
npm install
```

## 2. Set up MongoDB

You need a MongoDB instance — either:

**Option A — Local MongoDB**
Install MongoDB Community Server, then it typically runs at `mongodb://127.0.0.1:27017`.

**Option B — MongoDB Atlas (free cloud tier, recommended if you don't want to install anything)**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user (username + password)
3. Under Network Access, allow your IP (or `0.0.0.0/0` for easy dev access)
4. Copy your connection string, it looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lostandfound?retryWrites=true&w=majority`

## 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb://127.0.0.1:27017/lostandfound
PORT=5000
JWT_SECRET=some_long_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

Generate a strong `JWT_SECRET` quickly with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 4. Run the server

```bash
npm run dev     # with nodemon (auto-restarts on file changes) — use this while developing
npm start       # plain node, for production
```

You should see:
```
MongoDB connected: <host>
Server running on http://localhost:5000
```

Test it's alive: open `http://localhost:5000/api/health` in a browser — you should see a JSON status message.

## API Routes

| Method | Route | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account — `{ name, email, password }` |
| POST | `/api/auth/login` | No | Log in — `{ email, password }` |
| GET | `/api/auth/me` | Yes | Get current logged-in user |
| GET | `/api/items` | No | List items — query params: `q`, `type`, `category` |
| GET | `/api/items/mine` | Yes | Get items posted by the logged-in user |
| GET | `/api/items/:id` | No | Get a single item |
| POST | `/api/items` | Yes | Create item (multipart form — see below) |
| PATCH | `/api/items/:id/status` | Yes (owner only) | Update status — `{ status: "open" \| "resolved" }` |
| DELETE | `/api/items/:id` | Yes (owner only) | Delete an item |
| POST | `/api/items/:id/claim` | Yes | Send a claim message — `{ message }` |
| GET | `/api/items/:id/claims` | Yes (owner only) | View claims sent on your item |

All authenticated routes expect a header:
```
Authorization: Bearer <jwt_token>
```

### Creating an item (image upload)
`POST /api/items` expects `multipart/form-data`, not JSON, because of the image file:

```js
const formData = new FormData();
formData.append("type", "lost");
formData.append("title", "Navy blue backpack");
formData.append("category", "Bags & Wallets");
formData.append("description", "...");
formData.append("location", "Central Library");
formData.append("date", "2026-09-10");
formData.append("image", fileInput.files[0]); // the actual file

await axiosInstance.post("/items", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

Uploaded images are saved to `server/uploads/` and served at `http://localhost:5000/uploads/<filename>`. The API automatically returns the full URL in the `image` field of the response, so the frontend doesn't need to construct it.

## Connecting the React frontend

In your `client/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Then in `src/api/`, replace the calls in `mockService.js` with real axios calls through `axiosInstance.js`. Example for fetching items:

```js
// itemService.getAll
async getAll(filters = {}) {
  const { data } = await axiosInstance.get("/items", { params: filters });
  return data;
}
```

And for creating an item with a file upload:

```js
async create(formData) {
  const { data } = await axiosInstance.post("/items", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
```

Since every response here is already shaped to match what the frontend's mock service returns (same field names: `id`, `type`, `title`, `postedBy: { name, contact }`, etc.), no changes should be needed in the React components themselves — only in the service layer that calls the API.

## Running both frontend and backend together

Two terminals:

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm start
```

Backend on `:5000`, frontend on `:3000`. CORS is already configured to allow requests from `:3000`.

## Project structure

```
server/
├── config/
│   └── db.js               # MongoDB connection
├── models/
│   ├── User.js
│   ├── Item.js
│   └── Claim.js
├── controllers/
│   ├── authController.js
│   └── itemController.js
├── routes/
│   ├── authRoutes.js
│   └── itemRoutes.js
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── upload.js            # Multer config
│   └── errorHandler.js
├── uploads/                 # uploaded images land here
├── .env.example
├── server.js                # app entry point
└── package.json
```

## Notes on moving to production
- Swap local disk storage (Multer) for Cloudinary or S3 if deploying somewhere with an ephemeral filesystem (Render, Railway, Heroku) — local files can be wiped on redeploy.
- Set `CLIENT_URL` in `.env` to your deployed frontend's URL for CORS to work in production.
- Use a strong, unique `JWT_SECRET` and never commit `.env` to Git (already handled by `.gitignore`).
