import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  fetchSignInMethodsForEmail 
} from "firebase/auth";
import { auth } from "./firebase";

// Helper to get error messages
export const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case "auth/invalid-credential":
      return "Invalid email or password. If you used Google, please sign in with Google.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Sign in cancelled.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    default:
      return error.message.replace("Firebase: ", "").replace("Error ", "");
  }
};

// Check sign-in methods
export const checkLoginMethods = async (email) => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods;
  } catch (error) {
    console.error("Error fetching sign-in methods:", error);
    return [];
  }
};

// Login with Google
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error) {
    return { error };
  }
};

// Login with Email
export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { error };
  }
};

// Register with Email
export const registerWithEmail = async (email, password, name) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(result.user, { displayName: name });
    }
    return { user: result.user, error: null };
  } catch (error) {
    return { error };
  }
};
