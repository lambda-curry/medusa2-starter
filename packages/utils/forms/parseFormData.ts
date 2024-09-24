import { formDataToObject } from './formDataToObject';

export const parseFormData = (form?: HTMLFormElement | null) => {
  if (!form) return {};

  const data = new FormData(form);

  return formDataToObject(data);
};
