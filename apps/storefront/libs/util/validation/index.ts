import * as Yup from 'yup';

const emailRegex = /^[a-zA-Z0-9+._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // NOTE: yup email validation did not match our server validation so use this regex

export const emailAddressValidation = {
  email: Yup.string()
    .nullable()
    .matches(emailRegex, 'Please enter a valid email address.')
    .required('Email address is required'),
};

export const nameValidation = {
  firstName: Yup.string().nullable().required('First name is required'),
  lastName: Yup.string().nullable().required('Last name is required'),
};

export const phoneValidation = {
  phone: Yup.string().optional(),
};

export const addressValidation = {
  company: Yup.string().optional(),
  address1: Yup.string().required('Address is required'),
  address2: Yup.string().optional(),
  city: Yup.string().required('City is required'),
  province: Yup.string().required('State/province is required'),
  countryCode: Yup.string().required('Country is required'),
  postalCode: Yup.string().required('Postal Code is required'),
};
