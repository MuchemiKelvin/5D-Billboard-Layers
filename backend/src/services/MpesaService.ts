import { mpesaConfig } from '../utils/config';
import crypto from 'crypto';

const toBasicAuth = (key: string, secret: string): string => {
  return Buffer.from(`${key}:${secret}`).toString('base64');
};

export const getAccessToken = async (): Promise<string> => {
  const cfg = mpesaConfig();
  const res = await fetch(`${cfg.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${toBasicAuth(cfg.consumerKey, cfg.consumerSecret)}`
    }
  });
  if (!res.ok) throw new Error(`M-Pesa auth failed: ${res.status}`);
  const data: any = await res.json();
  return data.access_token as string;
};

const formatTimestamp = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
};

const generatePassword = (shortcode: string, passkey: string, timestamp: string): string => {
  const raw = `${shortcode}${passkey}${timestamp}`;
  return Buffer.from(raw).toString('base64');
};

export interface StkPushRequest {
  amount: number;
  phoneNumber: string; // 2547XXXXXXXX
  accountReference?: string;
  description?: string;
}

export const initiateHold = async (req: StkPushRequest): Promise<any> => {
  const cfg = mpesaConfig();
  const token = await getAccessToken();
  const timestamp = formatTimestamp();
  const password = generatePassword(cfg.shortcode, cfg.passkey, timestamp);

  const payload = {
    BusinessShortCode: cfg.shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: req.amount,
    PartyA: req.phoneNumber,
    PartyB: cfg.shortcode,
    PhoneNumber: req.phoneNumber,
    CallBackURL: cfg.callbackUrl,
    AccountReference: req.accountReference || 'EscrowHold',
    TransactionDesc: req.description || 'Escrow Hold Initiation'
  };

  const res = await fetch(`${cfg.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data: any = await res.json();
  return { status: res.status, data };
};

export interface B2BRequest {
  amount: number;
  receiverShortcode?: string; // defaults to env 247247
  accountReference?: string; // defaults to env 925759
  remarks?: string;
}

export const b2bTransfer = async (req: B2BRequest): Promise<any> => {
  const cfg = mpesaConfig();
  if (!cfg.initiatorName || !cfg.securityCredential || !cfg.b2bResultUrl || !cfg.b2bTimeoutUrl) {
    throw new Error('B2B config missing: ensure initiator, security credential, result/timeout URLs are set');
  }
  const token = await getAccessToken();
  const payload = {
    Initiator: cfg.initiatorName,
    SecurityCredential: cfg.securityCredential,
    CommandID: cfg.b2bCommandId,
    SenderIdentifierType: '4', // Shortcode
    RecieverIdentifierType: '4',
    Amount: req.amount,
    PartyA: cfg.shortcode,
    PartyB: req.receiverShortcode || cfg.b2bReceiverShortcode,
    Remarks: req.remarks || 'Escrow settlement',
    QueueTimeOutURL: cfg.b2bTimeoutUrl,
    ResultURL: cfg.b2bResultUrl,
    AccountReference: req.accountReference || cfg.b2bAccountReference
  };

  const res = await fetch(`${cfg.baseUrl}/mpesa/b2b/v1/paymentrequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data: any = await res.json();
  return { status: res.status, data };
};


