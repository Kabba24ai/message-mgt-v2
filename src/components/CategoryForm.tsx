import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Category, EmailCategory } from '../types';

interface CategoryFormProps {
  category?: Category | EmailCategory | null;
  onSave: (data: { name: string; description: string }) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSave({ name, description });
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          {saving ? 'Saving...' : category ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
