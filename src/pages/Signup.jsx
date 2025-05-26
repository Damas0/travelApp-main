import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";
import { MdFlight } from "react-icons/md";
import "./Auth.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      console.error("Erreur d'inscription:", error.message);
    }
  };

  return (
    <div className="signup-container">
      <motion.div
        className="signup-box"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <MdFlight className="logo" />
        <h2 className="signup-title">Inscription</h2>
        <form onSubmit={handleSignup} className="signup-form">
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
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="signup-button">
            {"S'inscrire"}
          </button>
        </form>

        <button className="google-signup-btn">
          <FaGoogle className="google-icon" /> {"S'inscrire avec Google"}
        </button>

        <p className="login-link">
          Déjà un compte ? <a href="/login">Connectez-vous</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
