import axios from 'axios';
import { showAlert } from './alert';
import { loadStripe } from '@stripe/stripe-js';
const Stripe = require('stripe');
// const stripe = Stripe(
//   'pk_test_51N3xLQC9roNfAMJylmTholmEIoyS0B8cfMjrOeavp1ozGyPYsKDDf6VNpckl9OIhjADlDvlGr1kJg5lAKwkv23Hr00Ac11NMsJ'
// );

export const bookTour = async (tourId) => {
  const stripe = await loadStripe(
    'pk_test_51N3xLQC9roNfAMJylmTholmEIoyS0B8cfMjrOeavp1ozGyPYsKDDf6VNpckl9OIhjADlDvlGr1kJg5lAKwkv23Hr00Ac11NMsJ'
  );
  try {
    // Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    // console.log(session);

    // create checkout session
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    showAlert('error');
  }
};
