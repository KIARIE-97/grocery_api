// src/payments/utils/mpesa.util.ts
import axios from 'axios';
import * as moment from 'moment';

//authorization
export async function getAccessToken(
  MPESA_CONSUMER_KEY: string,
  MPESA_CONSUMER_SECRET: string,
): Promise<string> {
  const url =
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth =
    'Basic ' +
    Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');

  const response = await axios.get(url, {
    headers: { Authorization: auth },
  });

  return response.data.access_token;
}

export async function triggerStkPush(
  phoneNumber: string,
  amount: number,
  accessToken: string,
  shortcode: number,
  passkey: string,
  callbackUrl: string,
): Promise<any> {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const password = Buffer.from(shortcode + passkey + timestamp).toString(
    'base64',
  );

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: callbackUrl,
    AccountReference: 'grocerJet',
    TransactionDesc: 'Payment for an order',
  };

  const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
  const auth = 'Bearer ' + accessToken;
  const response = await axios.post(url, payload, {
    headers: { Authorization: auth },
  });
// console.log(`STK Push Response: ${JSON.stringify(response.data)}`);
  return response.data;
}
