import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";
import { MdFlightTakeoff } from "react-icons/md";
import "./Auth.css"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      console.error("Erreur de connexion:", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/home");
    } catch (error) {
      console.error("Erreur avec Google:", error.message);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-box"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <MdFlightTakeoff className="logo" />
        <h2 className="login-title">Connexion</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">
            Se connecter
          </button>
        </form>

        <button className="google-login-btn" onClick={handleGoogleLogin}>
          <FaGoogle className="google-icon" /> Se connecter avec Google
        </button>

        <p className="signup-link">
          Pas encore de compte ? <a href="/signup">Inscrivez-vous</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
