import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import axios from "axios";

// Clerk Publishable Key (replace with your actual key)
const clerkPublishableKey = "VITE_CLERK_PUBLISHABLE_KEY"; 

const Login = ({ setUser }: { setUser: (user: { email: string; username: string; password: string }) => void }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/login", {
        name: username,
        password,
      });

      if (response.status === 200) {
        // On successful login, store user information and navigate to profile page
        setUser({ email, username, password });
        localStorage.setItem("token", response.data.token);
        navigate("/profile");
      }
    } catch (error: any) {
      if (error.response) {
        setMessage(error.response.data.message || "Login failed!");
      } else {
        setMessage("An error occurred during login.");
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <button type="submit" style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}>
          Login
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

const Profile = ({ user, setUser }: { user: { email: string; username: string; password: string }; setUser: (user: any) => void }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h1>Login Successful!</h1>
      <p>Email: {user.email}</p>
      <p>Username: {user.username}</p>
      <p>Password: *******</p>
      <button onClick={handleLogout} style={{ padding: "10px", fontSize: "16px", cursor: "pointer", marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<{ email: string; username: string; password: string } | null>(null);

  return (
      <Router>
        <header style={{ padding: "10px" }}>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Login setUser={setUser} />} />
        </Routes>
      </Router>
  );
};

export default App;
