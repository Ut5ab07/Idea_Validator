// Define the dedicated admin email address
export const ADMIN_EMAIL = "admin@ideavalidator.com";

// Check if a user is an admin
export const isAdmin = (user) => {
  return user && user.email === ADMIN_EMAIL;
};
