export const safeUser = (u) => {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
};
