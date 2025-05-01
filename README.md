# SkillBridge

SkillBridge is a **skill-sharing web application** that helps users connect, learn, and teach new skills in a community-driven way.

## 🚀 Features

- 🔐 **User Authentication** (Sign up / Login)
- 🧠 **Skill Management** (Add & Search Skills)
- 💬 **Messaging System** (Chat with other users)
- 🎯 **Skill Matchmaking**

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript (React if applicable)
- **Backend**: Node.js + Express
- **Database**: MongoDB (via Mongoose)
- **Auth**: JWT (JSON Web Tokens)
- **Hosting**: Replit / Render (or your choice)

## 📂 Project Structure

```
skillbridge/
├── client/          # Frontend code (if you have)
└── server/          # Backend code
```

## ⚙️ Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   ```

2. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in `/server`:
     ```
     MONGO_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     ```

4. **Run the app:**
   ```bash
   node server.js
   ```

5. **API endpoints:**
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `POST /api/skills/add`
   - `GET /api/skills/all`
   - `POST /api/messages/`
   - `GET /api/messages/:toUserId`

---

## 💡 Future Improvements

- Real-time chat (WebSockets)
- Push notifications
- Advanced skill recommendation system

---

## 📄 License

This project is licensed under the MIT License.
