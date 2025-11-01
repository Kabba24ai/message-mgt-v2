import { useState, useEffect } from 'react';
import { MessageCircle, Search, Plus } from 'lucide-react';
import { supabase } from './lib/supabase';
import { MessageTable } from './components/MessageTable';
import { MessageModal } from './components/MessageModal';
import { BroadcastModal } from './components/BroadcastModal';
import { CategoryForm } from './components/CategoryForm';
import { CategoryList } from './components/CategoryList';
import {
  TextMessage,
  EmailMessage,
  Category,
  EmailCategory,
  SalesFunnel,
  FunnelContentAssignment,
  MessageType
} from './types';

function App() {
  const [mainTab, setMainTab] = useState<'messages' | 'categories'>('messages');
  const [categoryTab, setCategoryTab] = useState<'sms' | 'email'>('sms');
  const [messageType, setMessageType] = useState<MessageType>('sms_broadcast');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [textMessages, setTextMessages] = useState<TextMessage[]>([]);
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [emailCategories, setEmailCategories] = useState<EmailCategory[]>([]);
  const [funnels, setFunnels] = useState<SalesFunnel[]>([]);
  const [funnelAssignments, setFunnelAssignments] = useState<FunnelContentAssignment[]>([]);

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<TextMessage | EmailMessage | null>(null);
  const [sendingMessage, setSendingMessage] = useState<TextMessage | EmailMessage | null>(null);
  const [sending, setSending] = useState(false);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | EmailCategory | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [textRes, emailRes, catRes, emailCatRes, funnelRes, assignRes] = await Promise.all([
        supabase.from('text_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('email_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('email_categories').select('*').order('name'),
        supabase.from('sales_funnels').select('*').order('name'),
        supabase.from('funnel_content_assignments').select('*')
      ]);

      if (textRes.error) throw textRes.error;
      if (emailRes.error) throw emailRes.error;
      if (catRes.error) throw catRes.error;
      if (emailCatRes.error) throw emailCatRes.error;
      if (funnelRes.error) throw funnelRes.error;
      if (assignRes.error) throw assignRes.error;

      setTextMessages(textRes.data || []);
      setEmailMessages(emailRes.data || []);
      setCategories(catRes.data || []);
      setEmailCategories(emailCatRes.data || []);
      setFunnels(funnelRes.data || []);
      setFunnelAssignments(assignRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMessages = (): (TextMessage | EmailMessage)[] => {
    const isSMS = messageType.startsWith('sms');
    const isBroadcast = messageType.includes('broadcast');

    let messages: (TextMessage | EmailMessage)[] = isSMS ? textMessages : emailMessages;

    messages = messages.filter((msg) => {
      const msgType = msg.message_type;
      const msgIsBroadcast = msgType === 'broadcast' || msgType === 'email_broadcast';
      return msgIsBroadcast === isBroadcast;
    });

    if (searchTerm) {
      messages = messages.filter((msg) =>
        msg.content_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      messages = messages.filter((msg) => msg.context_category === selectedCategory);
    }

    messages = [...messages].sort((a, b) => {
      if (isBroadcast) {
        const aHasSent = !!a.sent_date;
        const bHasSent = !!b.sent_date;

        if (!aHasSent && bHasSent) return -1;
        if (aHasSent && !bHasSent) return 1;

        if (aHasSent && bHasSent) {
          return new Date(b.sent_date!).getTime() - new Date(a.sent_date!).getTime();
        }

        return 0;
      } else {
        const catA = a.context_category || '';
        const catB = b.context_category || '';
        const catCompare = catA.localeCompare(catB);
        if (catCompare !== 0) return catCompare;
        return a.content_name.localeCompare(b.content_name);
      }
    });

    return messages;
  };

  const getFunnelAssignmentsMap = () => {
    const map = new Map<string, SalesFunnel[]>();
    funnelAssignments.forEach((assignment) => {
      const funnel = funnels.find((f) => f.id === assignment.funnel_id);
      if (funnel) {
        const existing = map.get(assignment.message_id) || [];
        map.set(assignment.message_id, [...existing, funnel]);
      }
    });
    return map;
  };

  const handleCreateMessage = () => {
    setEditingMessage(null);
    setModalOpen(true);
  };

  const handleEditMessage = (message: TextMessage | EmailMessage) => {
    setEditingMessage(message);
    setModalOpen(true);
  };

  const handleSaveMessage = async (data: Partial<TextMessage | EmailMessage>) => {
    try {
      const isSMS = messageType.startsWith('sms');
      const table = isSMS ? 'text_messages' : 'email_messages';

      if (editingMessage) {
        const { error } = await supabase
          .from(table)
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingMessage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .insert([data]);

        if (error) throw error;
      }

      await loadData();
      setModalOpen(false);
      setEditingMessage(null);
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  };

  const handleCopyMessage = async (message: TextMessage | EmailMessage) => {
    try {
      const isSMS = 'message_type' in message &&
        (message.message_type === 'broadcast' || message.message_type === 'funnel_content');
      const table = isSMS ? 'text_messages' : 'email_messages';

      const newData: any = {
        content_name: `${message.content_name} (Copy)`,
        context_category: message.context_category,
        content: message.content,
        message_type: message.message_type,
        created_date: new Date().toISOString()
      };

      if ('subject' in message) {
        newData.subject = message.subject;
      }

      const { error } = await supabase.from(table).insert([newData]);
      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error('Error copying message:', error);
      alert('Failed to copy message');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const isSMS = messageType.startsWith('sms');
      const table = isSMS ? 'text_messages' : 'email_messages';

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const handleSendMessage = (message: TextMessage | EmailMessage) => {
    setSendingMessage(message);
    setBroadcastModalOpen(true);
  };

  const handleConfirmSend = async () => {
    if (!sendingMessage) return;

    setSending(true);
    try {
      const isSMS = 'message_type' in sendingMessage &&
        (sendingMessage.message_type === 'broadcast' || sendingMessage.message_type === 'funnel_content');
      const table = isSMS ? 'text_messages' : 'email_messages';

      const { error } = await supabase
        .from(table)
        .update({ sent_date: new Date().toISOString() })
        .eq('id', sendingMessage.id);

      if (error) throw error;

      await loadData();
      setBroadcastModalOpen(false);
      setSendingMessage(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSaveCategory = async (data: { name: string; description: string }) => {
    try {
      const isSMS = categoryTab === 'sms';
      const table = isSMS ? 'categories' : 'email_categories';

      if (editingCategory) {
        const { error } = await supabase
          .from(table)
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert([data]);
        if (error) throw error;
      }

      await loadData();
      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  };

  const handleEditCategory = (category: Category | EmailCategory) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const isSMS = categoryTab === 'sms';
      const table = isSMS ? 'categories' : 'email_categories';

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const isSMS = messageType.startsWith('sms');
  const currentCategories = isSMS ? categories : emailCategories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900">Message Management</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setMainTab('messages')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  mainTab === 'messages'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Messages
              </button>
              <button
                onClick={() => setMainTab('categories')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  mainTab === 'categories'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Categories
              </button>
            </div>
          </div>

          {mainTab === 'messages' ? (
            <div className="p-6">
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setMessageType('sms_broadcast')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      messageType === 'sms_broadcast'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                    }`}
                  >
                    SMS Broadcast
                  </button>
                  <button
                    onClick={() => setMessageType('sms_funnel')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      messageType === 'sms_funnel'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    SMS Funnel Content
                  </button>
                  <button
                    onClick={() => setMessageType('email_broadcast')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      messageType === 'email_broadcast'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    Email Broadcast
                  </button>
                  <button
                    onClick={() => setMessageType('email_funnel')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      messageType === 'email_funnel'
                        ? 'bg-cyan-500 text-white shadow-md'
                        : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                    }`}
                  >
                    Email Funnel Content
                  </button>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by content name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {currentCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleCreateMessage}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    Create Message
                  </button>
                </div>
              </div>

              <MessageTable
                messages={getFilteredMessages()}
                type={isSMS ? 'sms' : 'email'}
                funnelAssignments={getFunnelAssignmentsMap()}
                onEdit={handleEditMessage}
                onCopy={handleCopyMessage}
                onDelete={handleDeleteMessage}
                onSend={handleSendMessage}
                loading={loading}
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setCategoryTab('sms')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      categoryTab === 'sms'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    SMS Categories
                  </button>
                  <button
                    onClick={() => setCategoryTab('email')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      categoryTab === 'email'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Email Categories
                  </button>
                </div>

                {!showCategoryForm ? (
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setShowCategoryForm(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    Create Category
                  </button>
                ) : (
                  <CategoryForm
                    category={editingCategory}
                    onSave={handleSaveCategory}
                    onCancel={() => {
                      setShowCategoryForm(false);
                      setEditingCategory(null);
                    }}
                  />
                )}
              </div>

              <CategoryList
                categories={categoryTab === 'sms' ? categories : emailCategories}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            </div>
          )}
        </div>
      </div>

      <MessageModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingMessage(null);
        }}
        onSave={handleSaveMessage}
        message={editingMessage}
        type={isSMS ? 'sms' : 'email'}
        messageType={
          messageType === 'sms_broadcast' ? 'broadcast' :
          messageType === 'sms_funnel' ? 'funnel_content' :
          messageType === 'email_broadcast' ? 'email_broadcast' :
          'email_funnel_content'
        }
        categories={currentCategories}
      />

      <BroadcastModal
        isOpen={broadcastModalOpen}
        onClose={() => {
          setBroadcastModalOpen(false);
          setSendingMessage(null);
        }}
        onConfirm={handleConfirmSend}
        messageName={sendingMessage?.content_name || ''}
        sending={sending}
      />
    </div>
  );
}

export default App;
