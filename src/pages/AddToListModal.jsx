// AddToListModal.jsx
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebaseConfig";
import PropTypes from 'prop-types';
import "./AddToListModal.css";

const AddToListModal = ({ item, onClose }) => {
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Récupérer les listes de l'utilisateur depuis Firestore
  useEffect(() => {
    const fetchLists = async () => {
      if (!currentUser) return;
      const q = query(collection(db, "voyages"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const lists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserLists(lists);
      setLoading(false);
    };

    if (currentUser) {
      fetchLists();
    }
  }, [currentUser]);

  const handleSelectList = async (listId) => {
    try {
      const listRef = doc(db, "voyages", listId);
      await updateDoc(listRef, {
        items: arrayUnion(item)
      });
      alert("L'élément a été ajouté à votre liste !");
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      alert("Une erreur est survenue lors de l'ajout.");
    }
  };

  return (
    <div className="add-to-list-modal-overlay" onClick={onClose}>
      <div className="add-to-list-modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="add-to-list-modal-title">Choisissez votre liste</h2>
        {loading ? (
          <p className="add-to-list-modal-message">Chargement...</p>
        ) : userLists.length > 0 ? (
          <ul className="add-to-list-modal-list">
            {userLists.map(list => (
              <li 
                key={list.id} 
                className="add-to-list-modal-item"
                onClick={() => handleSelectList(list.id)}
              >
                {list.titre || "Ma liste"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="add-to-list-modal-message">
            Aucune liste trouvée. Veuillez créer une liste dans votre espace.
          </p>
        )}
        <button className="add-to-list-modal-button" onClick={onClose}>
          Annuler
        </button>
      </div>
    </div>
  );
};

AddToListModal.propTypes = {
  item: PropTypes.shape({
    type: PropTypes.oneOf(['flight', 'hotel', 'car']).isRequired,
    data: PropTypes.object.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

AddToListModal.defaultProps = {
  onClose: () => console.warn('onClose prop not provided to AddToListModal')
};

export default AddToListModal;
