export const formatDate = (date: Date, format = 'en-US') => {
  return new Intl.DateTimeFormat(format, { dateStyle: 'medium' }).format(date);
};

export const formatList = (list: string[]) => {
  return new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(list);
};
