/**
 * Helper to execute validations and return error responses
 */
const validate = (schemaFn) => {
  return (req, res, next) => {
    const errors = schemaFn(req.body);
    if (errors && errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    next();
  };
};

// Registration schemas validator
const registrationSchema = (body) => {
  const { name, email, password } = body;
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) errors.push('A valid email address is required.');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
  return errors;
};

// Login schemas validator
const loginSchema = (body) => {
  const { email, password } = body;
  const errors = [];
  if (!email) errors.push('Email is required.');
  if (!password) errors.push('Password is required.');
  return errors;
};

// Project schemas validator
const projectSchema = (body) => {
  const { name } = body;
  const errors = [];
  if (!name || name.trim().length < 1) errors.push('Project name is required.');
  return errors;
};

// Image generation schemas validator
const generateSchema = (body) => {
  const { prompt } = body;
  const errors = [];
  if (!prompt || prompt.trim().length < 3) errors.push('Prompt is required and must be at least 3 characters.');
  return errors;
};

module.exports = {
  validateRegistration: validate(registrationSchema),
  validateLogin: validate(loginSchema),
  validateProject: validate(projectSchema),
  validateGenerate: validate(generateSchema)
};
