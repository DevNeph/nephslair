export async function request(fn, setError, setLoading) {
  try {
    setLoading?.(true);
    return await fn();
  } catch (e) {
    setError?.(e.response?.data?.message || 'Error');
    throw e;
  } finally {
    setLoading?.(false);
  }
}
