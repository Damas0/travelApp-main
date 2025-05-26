import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import HomePage from "./pages/HomePage.jsx";
import FlightsPage from "./pages/FlightsPage.jsx";
import HotelsPage from "./pages/HotelsPage.jsx";
import CarsPage from "./pages/CarsPage.jsx";
import ListeVoyage from "./pages/ListeVoyage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import VoyageDetail from "./pages/VoyageDetail.jsx";

import Navbar from "./Navbar/Navbar.jsx";

const App = () => {
  return (
    <Router>
      <div className="body-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/liste-voyages" element={<ListeVoyage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/voyage/:id" element={<VoyageDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
