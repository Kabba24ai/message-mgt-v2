export interface TextMessage {
  id: string;
  context_category: string | null;
  content_name: string;
  content: string;
  message_type: 'broadcast' | 'funnel_content';
  created_date: string;
  sent_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailMessage {
  id: string;
  context_category: string | null;
  content_name: string;
  subject: string;
  content: string;
  message_type: 'email_broadcast' | 'email_funnel_content';
  sent_date: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesFunnel {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FunnelContentAssignment {
  id: string;
  funnel_id: string;
  message_id: string;
  created_at: string;
}

export type MessageType = 'sms_broadcast' | 'sms_funnel' | 'email_broadcast' | 'email_funnel';
