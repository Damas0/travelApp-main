import { useEffect, useState } from "react";
import { auth, db, storage } from "../firebaseConfig"; 
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { 
  collection, getDocs, query, where, addDoc, deleteDoc, doc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./ListeVoyage.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen,faPlane, faHotel, faCar  } from '@fortawesome/free-solid-svg-icons';

const ListeVoyage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voyages, setVoyages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    destination: '',
    dateDepart: '',
    dateRetour: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Récupérer les voyages de l'utilisateur
  const fetchVoyages = async () => {
    if (!user) return;
    try {
      const voyagesCollection = collection(db, "voyages");
      const q = query(voyagesCollection, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const voyagesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVoyages(voyagesList);
    } catch (error) {
      console.error("Erreur lors de la récupération des voyages: ", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVoyages();
    }
  }, [user]);

  // Création d'un voyage
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Veuillez ajouter une image !");
      return;
    }
    try {
      const imageRef = ref(storage, `voyages/${user.uid}/${formData.image.name}`);
      const snapshot = await uploadBytes(imageRef, formData.image);
      const imageUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "voyages"), {
        userId: user.uid,
        titre: formData.titre,
        destination: formData.destination,
        dateDepart: formData.dateDepart,
        dateRetour: formData.dateRetour,
        imageUrl,
        items: []
      });

      alert("Voyage créé avec succès !");
      setFormData({ titre: '', destination: '', dateDepart: '', dateRetour: '', image: null });
      setShowForm(false);
      fetchVoyages();
    } catch (error) {
      console.error("Erreur lors de l'ajout du voyage: ", error);
      alert("Erreur lors de l'ajout du voyage.");
    }
  };

  // Suppression d'un voyage
  const handleDelete = async (voyageId) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce voyage ?")) {
      try {
        await deleteDoc(doc(db, "voyages", voyageId));
        setVoyages(voyages.filter(v => v.id !== voyageId));
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression du voyage.");
      }
    }
  };


  const handleEdit = (voyage) => {
    alert(`Modifier le voyage: ${voyage.titre}`);
  };

  // Gérer les changements de champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gérer l'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Accès restreint</h2>
        <p>Vous devez être connecté pour accéder à cette page.</p>
        <Link to="/login">
          <button style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
            Se connecter
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Mes Listes de Voyage</h1>
        <button
          className="create-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Annuler" : "Créer un voyage"}
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Créer un nouveau voyage</h2>
              <button className="close-button" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleFormSubmit} className="form-voyage">
              <input
                type="text"
                name="titre"
                placeholder="Titre du voyage"
                value={formData.titre}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="destination"
                placeholder="Destination"
                value={formData.destination}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                name="dateDepart"
                value={formData.dateDepart}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                name="dateRetour"
                value={formData.dateRetour}
                onChange={handleChange}
                required
              />
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                required
              />
              {imagePreview && (
                <img src={imagePreview} alt="Prévisualisation" className="image-preview" />
              )}
              <button type="submit" className="submit-button">Ajouter le voyage</button>
            </form>
          </div>
        </div>
      )}

      <div className="voyages-list">
        {voyages.length === 0 ? (
          <p>Aucun voyage trouvé. Ajoutez-en un !</p>
        ) : (
          voyages.map((voyage) => (
            <div key={voyage.id} className="voyage-card">
              <img
                src={voyage.imageUrl}
                alt="Image du voyage"
                className="voyage-image"
                onClick={() => navigate(`/voyage/${voyage.id}`)}
                style={{ cursor: "pointer" }}
              />
              <div className="voyage-details">
                <div className="voyage-content">
                  <div className="voyage-header">
                    <h3
                      onClick={() => navigate(`/voyage/${voyage.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {voyage.titre}
                    </h3>
                  </div>
                  <p><strong>Destination:</strong> {voyage.destination}</p>
                  <p><strong>Date de départ:</strong> {voyage.dateDepart}</p>
                  <p><strong>Date de retour:</strong> {voyage.dateRetour}</p>
                </div>
                <div className="voyage-actions">
                  <div className="item-types">
                    <FontAwesomeIcon 
                      icon={faPlane} 
                      className={`type-icon ${voyage.items?.some(item => item.type === 'flight') ? 'active' : ''}`}
                    />
                    <FontAwesomeIcon 
                      icon={faHotel} 
                      className={`type-icon ${voyage.items?.some(item => item.type === 'hotel') ? 'active' : ''}`}
                    />
                    <FontAwesomeIcon 
                      icon={faCar} 
                      className={`type-icon ${voyage.items?.some(item => item.type === 'car') ? 'active' : ''}`}
                    />
                  </div>
                  <div className="button-group">
                    <button
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(voyage);
                      }}
                      aria-label="Modifier le voyage"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(voyage.id);
                      }}
                      aria-label="Supprimer le voyage"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListeVoyage;
