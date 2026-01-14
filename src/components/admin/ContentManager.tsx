import { useState } from 'react';
import { useSiteContent, SiteContent } from '@/hooks/useSiteContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Pencil, Trash2, Search, X, Save, Languages } from 'lucide-react';
import { toast } from 'sonner';

const ContentManager = () => {
  const { content, contentByCategory, categories, contentTypes, loading, addContent, updateContent, deleteContent } = useSiteContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SiteContent>>({});
  const [newContent, setNewContent] = useState({
    content_key: '',
    content_en: '',
    content_fr: '',
    content_ar: '',
    content_type: 'text',
    category: 'general',
    description: '',
  });

  const filteredContent = content.filter(item =>
    item.content_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredByCategory = filteredContent.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SiteContent[]>);

  const handleAdd = async () => {
    if (!newContent.content_key || !newContent.content_en) {
      toast.error('Key and English content are required');
      return;
    }

    try {
      await addContent(newContent);
      setNewContent({
        content_key: '',
        content_en: '',
        content_fr: '',
        content_ar: '',
        content_type: 'text',
        category: 'general',
        description: '',
      });
      setIsAdding(false);
      toast.success('Content added successfully');
    } catch (err) {
      toast.error('Failed to add content');
    }
  };

  const handleEdit = (item: SiteContent) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm) return;

    try {
      await updateContent(editingId, editForm);
      setEditingId(null);
      setEditForm({});
      toast.success('Content updated successfully');
    } catch (err) {
      toast.error('Failed to update content');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await deleteContent(id);
      toast.success('Content deleted successfully');
    } catch (err) {
      toast.error('Failed to delete content');
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'title': return 'default';
      case 'button': return 'secondary';
      case 'placeholder': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Languages className="h-6 w-6" />
            Content & Translations
          </h2>
          <p className="text-muted-foreground">Manage all platform texts in English, French, and Arabic</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by key, content, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Add New Content Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add New Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Content Key (unique)</Label>
                <Input
                  value={newContent.content_key}
                  onChange={(e) => setNewContent({ ...newContent, content_key: e.target.value })}
                  placeholder="e.g., heroTitle"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={newContent.content_type} onValueChange={(value) => setNewContent({ ...newContent, content_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="button">Button</SelectItem>
                    <SelectItem value="placeholder">Placeholder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newContent.category} onValueChange={(value) => setNewContent({ ...newContent, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    <SelectItem value="general">general</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={newContent.description}
                onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                placeholder="Where is this content used?"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>English 🇬🇧</Label>
                <Textarea
                  value={newContent.content_en}
                  onChange={(e) => setNewContent({ ...newContent, content_en: e.target.value })}
                  placeholder="English text"
                />
              </div>
              <div>
                <Label>French 🇫🇷</Label>
                <Textarea
                  value={newContent.content_fr}
                  onChange={(e) => setNewContent({ ...newContent, content_fr: e.target.value })}
                  placeholder="French text"
                />
              </div>
              <div>
                <Label>Arabic 🇲🇦</Label>
                <Textarea
                  value={newContent.content_ar}
                  onChange={(e) => setNewContent({ ...newContent, content_ar: e.target.value })}
                  placeholder="Arabic text"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content by Category */}
      <Accordion type="multiple" defaultValue={categories} className="space-y-4">
        {Object.entries(filteredByCategory).map(([category, items]) => (
          <AccordionItem key={category} value={category} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="font-semibold capitalize">{category}</span>
                <Badge variant="secondary">{items.length} items</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {items.map((item) => (
                  <Card key={item.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      {editingId === item.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>English 🇬🇧</Label>
                              <Textarea
                                value={editForm.content_en || ''}
                                onChange={(e) => setEditForm({ ...editForm, content_en: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>French 🇫🇷</Label>
                              <Textarea
                                value={editForm.content_fr || ''}
                                onChange={(e) => setEditForm({ ...editForm, content_fr: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Arabic 🇲🇦</Label>
                              <Textarea
                                value={editForm.content_ar || ''}
                                onChange={(e) => setEditForm({ ...editForm, content_ar: e.target.value })}
                                dir="rtl"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Type</Label>
                              <Select value={editForm.content_type} onValueChange={(value) => setEditForm({ ...editForm, content_type: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="title">Title</SelectItem>
                                  <SelectItem value="button">Button</SelectItem>
                                  <SelectItem value="placeholder">Placeholder</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-sm bg-background px-2 py-1 rounded">{item.content_key}</code>
                              <Badge variant={getTypeBadgeVariant(item.content_type)}>{item.content_type}</Badge>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="font-medium">🇬🇧 </span>
                                <span className="text-muted-foreground">{item.content_en}</span>
                              </div>
                              <div>
                                <span className="font-medium">🇫🇷 </span>
                                <span className="text-muted-foreground">{item.content_fr}</span>
                              </div>
                              <div dir="rtl">
                                <span className="font-medium">🇲🇦 </span>
                                <span className="text-muted-foreground">{item.content_ar}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No content found matching your search.
        </div>
      )}
    </div>
  );
};

export default ContentManager;
