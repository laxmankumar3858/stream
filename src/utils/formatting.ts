export const formatPhoneNumber = (phone: string) => {
  return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
};
