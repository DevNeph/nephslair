import { useState } from 'react';

export function useFormHandler(initialValues, validate = () => ({})) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(err => ({ ...err, [name]: '' }));
  }

  function setFieldValue(name, value) {
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(err => ({ ...err, [name]: '' }));
  }

  function resetForm(newValues = initialValues) {
    setForm(newValues);
    setErrors({});
  }

  function handleSubmit(callback) {
    return async (e) => {
      e.preventDefault();
      const validationErrors = validate(form);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
      setLoading(true);
      try {
        await callback(form);
      } finally {
        setLoading(false);
      }
    };
  }

  return { form, errors, loading, handleChange, setFieldValue, resetForm, handleSubmit };
}
