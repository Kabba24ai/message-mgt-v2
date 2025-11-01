import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TextMessage, EmailMessage, Category, EmailCategory } from '../types';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<TextMessage | EmailMessage>) => Promise<void>;
  message?: TextMessage | EmailMessage | null;
  type: 'sms' | 'email';
  messageType: 'broadcast' | 'funnel_content' | 'email_broadcast' | 'email_funnel_content';
  categories: Category[] | EmailCategory[];
}

export function MessageModal({
  isOpen,
  onClose,
  onSave,
  message,
  type,
  messageType,
  categories
}: MessageModalProps) {
  const [formData, setFormData] = useState({
    content_name: '',
    context_category: '',
    subject: '',
    content: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (message) {
      setFormData({
        content_name: message.content_name,
        context_category: message.context_category || '',
        subject: 'subject' in message ? message.subject : '',
        content: message.content
      });
    } else {
      setFormData({
        content_name: '',
        context_category: '',
        subject: '',
        content: ''
      });
    }
  }, [message, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data: any = {
        content_name: formData.content_name,
        context_category: formData.context_category || null,
        content: formData.content,
        message_type: messageType
      };

      if (type === 'email') {
        data.subject = formData.subject;
      }

      if (!message) {
        data.created_date = new Date().toISOString();
      }

      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving message:', error);
      alert('Failed to save message');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {message ? 'Edit Message' : 'Create New Message'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Name *
            </label>
            <input
              type="text"
              value={formData.content_name}
              onChange={(e) => setFormData({ ...formData, content_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.context_category}
              onChange={(e) => setFormData({ ...formData, context_category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {type === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : message ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
