import { Calendar, Send, Edit, Copy, Trash2 } from 'lucide-react';
import { TextMessage, EmailMessage, SalesFunnel } from '../types';

interface MessageTableProps {
  messages: (TextMessage | EmailMessage)[];
  type: 'sms' | 'email';
  funnelAssignments: Map<string, SalesFunnel[]>;
  onEdit: (message: TextMessage | EmailMessage) => void;
  onCopy: (message: TextMessage | EmailMessage) => void;
  onDelete: (id: string) => void;
  onSend: (message: TextMessage | EmailMessage) => void;
  loading: boolean;
}

export function MessageTable({
  messages,
  type,
  funnelAssignments,
  onEdit,
  onCopy,
  onDelete,
  onSend,
  loading
}: MessageTableProps) {
  const isBroadcast = (msg: TextMessage | EmailMessage) => {
    return msg.message_type === 'broadcast' || msg.message_type === 'email_broadcast';
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not sent';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No messages found. Create your first message to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Content Category</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Content Name</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              {type === 'email' ? 'Subject' : 'Content'}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Created Date</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              {isBroadcast(messages[0]) ? 'Sent Date' : 'Sales Funnels'}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => {
            const funnels = funnelAssignments.get(message.id) || [];
            const broadcast = isBroadcast(message);

            return (
              <tr key={message.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-gray-700">
                  {message.context_category || '-'}
                </td>
                <td className="py-3 px-4 font-medium text-gray-900">
                  {message.content_name}
                </td>
                <td className="py-3 px-4 text-gray-600 max-w-md truncate">
                  {type === 'email' && 'subject' in message ? message.subject : message.content}
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate('created_date' in message ? message.created_date : message.created_at)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {broadcast ? (
                    <span className={`text-sm ${message.sent_date ? 'text-green-600' : 'text-amber-600'}`}>
                      {formatDate(message.sent_date)}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {funnels.length > 0 ? (
                        funnels.map((funnel) => (
                          <span
                            key={funnel.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {funnel.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">No funnels</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {broadcast && !message.sent_date && (
                      <button
                        onClick={() => onSend(message)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Send"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(message)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onCopy(message)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(message.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
