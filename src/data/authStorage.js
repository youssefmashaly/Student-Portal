const USERS_KEY = 'guc_projecthub_users';
const CURRENT_USER_KEY = 'guc_projecthub_current_user';

function readUsersSafe() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw === null || raw === '') return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Canonical demo rows inserted only when that email is not already present (never overwrites). */
const DEMO_ACCOUNTS = [
  {
    firstName: 'Demo',
    lastName: 'Student',
    email: 'student@student.guc.edu.eg',
    password: '123456',
    role: 'student',
    major: 'Computer Science',
    graduationYear: '2026',
  },
  {
    firstName: 'Ahmed',
    lastName: 'Mohamed',
    email: 'ahmed@student.guc.edu.eg',
    password: '123456',
    role: 'student',
    major: 'Computer Science',
    graduationYear: '2026',
  },
  {
    firstName: 'Sara',
    lastName: 'El-Masry',
    email: 'student2@guc.edu.eg',
    password: '123456',
    role: 'student',
    major: 'Computer Science',
    graduationYear: '2026',
  },
  {
    firstName: 'Demo',
    lastName: 'Instructor',
    email: 'instructor@guc.edu.eg',
    password: '123456',
    role: 'instructor',
  },
  {
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@guc.edu.eg',
    password: '123456',
    role: 'admin',
  },
  {
    companyName: 'Demo Company',
    email: 'company@example.com',
    password: '123456',
    role: 'employer',
    status: 'pending verification',
  },
];

// --- GLOBAL DATABASE (localStorage) ---

/**
 * Ensures required demo accounts exist. Missing/corrupt storage starts from [].
 * Adds each demo account only if no user with that email exists (no overwrites).
 * @returns {object[]} final merged users array
 */
export const seedDemoUsers = () => {
  let users = readUsersSafe();
  const emails = new Set(
    users.map((u) => (u && u.email ? String(u.email).toLowerCase() : null)).filter(Boolean),
  );

  let changed = false;
  for (const demo of DEMO_ACCOUNTS) {
    const key = demo.email.toLowerCase();
    if (!emails.has(key)) {
      users.push({ ...demo });
      emails.add(key);
      changed = true;
    }
  }

  if (changed) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  return users;
};

export const getUsers = () => seedDemoUsers();

export const saveUser = (userObj) => {
  const users = getUsers();
  users.push(userObj);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const findUserByEmail = (email) => {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
};

// --- EMPLOYER SPECIFIC PROFILES (localStorage) ---

export const getEmployerProfile = (email) => {
  const key = `employer_profile_${email.toLowerCase()}`;
  const profile = localStorage.getItem(key);
  return profile ? JSON.parse(profile) : null;
};

export const saveEmployerProfile = (email, profileData) => {
  const key = `employer_profile_${email.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(profileData));
};

// --- ISOLATED TAB SESSIONS (sessionStorage) ---

export const loginUser = (email, password) => {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalized);

  if (!user || user.password !== password) {
    return null;
  }

  const { password: _removed, ...sessionUser } = user;
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};

export const getCurrentUser = () => {
  const user = sessionStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const logoutUser = () => {
  sessionStorage.removeItem(CURRENT_USER_KEY);
};
