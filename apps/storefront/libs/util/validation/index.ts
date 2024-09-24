import * as Yup from 'yup';

const emailRegex = /^[a-zA-Z0-9+._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // NOTE: yup email validation did not match our server validation so use this regex

export const emailAddressValidation = {
  email: Yup.string()
    .nullable()
    .matches(emailRegex, 'Please enter a valid email address.')
    .required('Email address is required')
};

export const createProductReviewValidation = {
  product_id: Yup.string().optional(),
  rating: Yup.number().nullable().required('Rating is required'),
  content: Yup.string().nullable().required('Content is required')
};

export const updateProductReviewValidation = {
  id: Yup.string().required('Review id is required'),
  product_id: Yup.string().required('Product id is required'),
  rating: Yup.number().nullable().required('Rating is required'),
  content: Yup.string().nullable().required('Content is required')
};

export const confirmPasswordValidation = {
  password: Yup.string().nullable().optional(),
  confirmPassword: Yup.string()
    .nullable()
    .when('password', {
      is: (password: string) => password && password.length > 0,
      then: Yup.string()
        .oneOf([Yup.ref('password'), null, '', undefined], 'Passwords must match')
        .required('Please confirm your new password.')
    })
};

export const nameValidation = {
  firstName: Yup.string().nullable().required('First name is required'),
  lastName: Yup.string().nullable().required('Last name is required')
};

export const phoneValidation = {
  phone: Yup.string().optional()
};

export const addressValidation = {
  company: Yup.string().optional(),
  address1: Yup.string().required('Address is required'),
  address2: Yup.string().optional(),
  city: Yup.string().required('City is required'),
  province: Yup.string().required('State/province is required'),
  countryCode: Yup.string().required('Country is required'),
  // countryCode: Yup.string().oneOf(['US', 'us'], 'Country must be U.S.').required('Country is required'),
  postalCode: Yup.string()
    .required('Postal Code is required')
    .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, 'Must be a valid US Postal Code')
};
