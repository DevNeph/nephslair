export async function request(fn, setError, setLoading) {
  try {
    setLoading?.(true);
    return await fn();
  } catch (e) {
    setError?.(e.response?.data?.message || 'Bir hata oluştu');
    throw e;
  } finally {
    setLoading?.(false);
  }
}
