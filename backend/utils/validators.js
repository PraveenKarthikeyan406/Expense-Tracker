// Validation utility functions for signup

function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    return { valid: false, message: 'Name cannot be empty' };
  }
  
  // Only alphabets and spaces allowed, no numbers or special characters
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { valid: false, message: 'Name must contain only alphabets and spaces' };
  }
  
  return { valid: true, value: trimmedName };
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  if (trimmedEmail.length === 0) {
    return { valid: false, message: 'Email cannot be empty' };
  }
  
  // Check if email starts with a number
  if (/^\d/.test(trimmedEmail)) {
    return { valid: false, message: 'Email cannot start with a number' };
  }
  
  // Check for valid email format (at least 3 characters before @gmail.com)
  // First character must be a letter, total 3 or more characters allowed
  const emailRegex = /^[a-zA-Z][a-zA-Z0-9]{2,}@gmail\.com$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, message: 'Enter valid email' };
  }
  
  return { valid: true, value: trimmedEmail };
}

function validatePassword(password, name = '') {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  // Minimum 6 characters
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  // Check for consecutive numbers (e.g., 123456, 111111)
  const consecutiveNumbers = /^(\d)\1+$|012345|123456|234567|345678|456789|567890|654321|543210|432109|321098|210987|109876|098765/;
  if (consecutiveNumbers.test(password)) {
    return { valid: false, message: 'Choose a different strong password (avoid consecutive or repeated numbers)' };
  }
  
  // Check if password is too similar to name
  if (name && password.toLowerCase().includes(name.toLowerCase().split(' ')[0])) {
    return { valid: false, message: 'Choose a different strong password (password should not contain your name)' };
  }
  
  // Check for common weak passwords
  const weakPasswords = ['password', 'pass123', 'qwerty', 'abc123', '123abc', 'password123'];
  if (weakPasswords.includes(password.toLowerCase())) {
    return { valid: false, message: 'Choose a different strong password (this password is too common)' };
  }
  
  // Strong password should have at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Choose a different strong password (include both letters and numbers)' };
  }
  
  return { valid: true };
}

module.exports = {
  validateName,
  validateEmail,
  validatePassword
};
