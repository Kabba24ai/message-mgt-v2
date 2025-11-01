import { Edit, Trash2 } from 'lucide-react';
import { Category, EmailCategory } from '../types';

interface CategoryListProps {
  categories: Category[] | EmailCategory[];
  onEdit: (category: Category | EmailCategory) => void;
  onDelete: (id: string) => void;
}

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No categories found. Create your first category to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
              {category.description && (
                <p className="text-gray-600 text-sm">{category.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onEdit(category)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
