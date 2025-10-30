function validateFields(body, requiredFields) {
  for (const field of requiredFields) {
    if (!body[field]) return `${field} is required`;
  }
  return null;
}

module.exports = { validateFields };
