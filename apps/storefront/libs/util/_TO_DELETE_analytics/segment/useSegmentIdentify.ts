// import { type Customer } from '@markethaus/storefront-client';
// import { useCustomer } from '@storefront/ui-components/hooks/useCustomer';
// import { isBrowser } from '@utils/browser';
// import { useEffect, useRef } from 'react';
// import { useAnalytics } from '../useAnalytics';
// import { identifySegmentUser } from '../helpers';

// export const useSegmentIdentify = () => {
//   const { customer } = useCustomer();
//   const alreadyIdentified = useRef(false);

//   useEffect(() => {
//     if (!customer || !isBrowser() || alreadyIdentified.current) return;
//     void identifySegmentUser(customer);
//     alreadyIdentified.current = true;
//   }, [customer]);
// };

// export const useSubscribeUser = (listId: string) => {
//   const { customer } = useCustomer();
//   const { sendSegmentEvent } = useAnalytics();

//   const identifyAndSubscribe = async (
//     customer:
//       | Omit<Partial<Customer>, 'password_hash'>
//       | {
//           id: string;
//           email: string;
//           first_name: string;
//           last_name: string;
//         },
//     listId: string
//   ) => {
//     if (!customer) return;
//     return await identifySegmentUser(customer).then(async context => {
//       await sendSegmentEvent('Subscribed to newsletter', {
//         listId
//       });
//       return context;
//     });
//   };

//   const subscribeUser = async (email: string) => {
//     const subscriber = customer
//       ? customer
//       : {
//           id: email,
//           email,
//           first_name: '',
//           last_name: ''
//         };

//     return await identifyAndSubscribe(subscriber, listId);
//   };

//   return subscribeUser;
// };
