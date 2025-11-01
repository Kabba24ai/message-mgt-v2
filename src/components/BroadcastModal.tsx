import { X } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  messageName: string;
  sending: boolean;
}

export function BroadcastModal({
  isOpen,
  onClose,
  onConfirm,
  messageName,
  sending
}: BroadcastModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Send Broadcast</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to send this broadcast message?
          </p>
          <p className="font-medium text-gray-900 mb-6">
            "{messageName}"
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={sending}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
