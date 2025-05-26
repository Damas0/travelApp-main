import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error.message);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">SkyHigh</div>
  
      <button 
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
  
      {/* Menu mobile unifié */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul className="navbar-links">
          <li><Link to="/home" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/flights" onClick={() => setIsMobileMenuOpen(false)}>Vols</Link></li>
          <li><Link to="/hotels" onClick={() => setIsMobileMenuOpen(false)}>Hôtels</Link></li>
          <li><Link to="/cars" onClick={() => setIsMobileMenuOpen(false)}>Location</Link></li>
          {user ? (
            <>
              <li className="user-email"><strong>{user.email}</strong></li>
              <li>
                <button className="logout-btn" onClick={handleLogout}>
                  <strong>Déconnexion</strong>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="signup-btn"><strong>Sign Up</strong></button>
                </Link>
              </li>
              <li>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="signin-btn"><strong>Sign In</strong></button>
                </Link>
              </li>
            </>
          )}
          <li>
            <Link to="/liste-voyages" onClick={() => setIsMobileMenuOpen(false)}>
              <ShoppingCart className="cart-icon" />
            </Link>
          </li>
        </ul>
      </div>
  
      {/* Menu desktop */}
      <div className="desktop-menu">
        <div className="navbar-links-container">
          <ul className="navbar-links">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/flights">Vols</Link></li>
            <li><Link to="/hotels">Hôtels</Link></li>
            <li><Link to="/cars">Location</Link></li>
          </ul>
        </div>
  
        <div className="navbar-actions">
          {user ? (
            <>
              <span className="user-email"><strong>{user.email}</strong></span>
              <button className="logout-btn" onClick={handleLogout}>
                <strong>Déconnexion</strong>
              </button>
            </>
          ) : (
            <>
              <Link to="/signup">
                <button className="signup-btn"><strong>Sign Up</strong></button>
              </Link>
              <Link to="/login">
                <button className="signin-btn"><strong>Sign In</strong></button>
              </Link>
            </>
          )}
          <Link to="/liste-voyages">
            <ShoppingCart className="cart-icon" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
