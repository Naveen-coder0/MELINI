import { useMemo, useState } from 'react';
import { GripVertical, Pencil, Plus, Save, Trash2, Upload } from 'lucide-react';
import { Product } from '@/data/products';
import { useProducts } from '@/contexts/ProductContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const emptyProduct: Product = {
  id: '',
  name: '',
  slug: '',
  price: 0,
  description: '',
  shortDescription: '',
  category: 'summer',
  images: [],
  sizes: ['S', 'M', 'L'],
  colors: [{ name: 'Black', value: '#111111' }],
  inStock: true,
  material: '',
  careInstructions: ['Machine wash cold'],
  features: ['Comfort fit'],
};

const createSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const Admin = () => {
  const { products, addProduct, updateProduct, deleteProduct, isLoading, error } = useProducts();
  const { adminEmail, logout } = useAuth();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [form, setForm] = useState<Product>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const isEditMode = Boolean(editingId);

  const formTitle = useMemo(() => (isEditMode ? 'Edit Product' : 'Add New Product'), [isEditMode]);

  const updateForm = <K extends keyof Product>(field: K, value: Product[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setDragIndex(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = reader.result?.toString();
        if (!image) return;
        setForm((prev) => ({ ...prev, images: [...prev.images, image] }));
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  };

  const handleImageDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleImageDrop = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) return;

    setForm((prev) => {
      const updatedImages = [...prev.images];
      const [draggedImage] = updatedImages.splice(dragIndex, 1);
      updatedImages.splice(dropIndex, 0, draggedImage);
      return { ...prev, images: updatedImages };
    });
    setDragIndex(null);
  };

  const handleEdit = (product: Product) => {
    setForm(product);
    setEditingId(product.id);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const id = editingId ?? `${Date.now()}`;
    const normalizedName = form.name.trim();
    const normalizedSlug = form.slug.trim() || createSlug(normalizedName);

    const payload: Product = {
      ...form,
      id,
      name: normalizedName,
      slug: normalizedSlug,
      price: Number(form.price) || 0,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim(),
      material: form.material.trim(),
      images: form.images.filter(Boolean),
      sizes: form.sizes.filter(Boolean),
      careInstructions: form.careInstructions.filter(Boolean),
      features: form.features.filter(Boolean),
    };

    try {
      setRequestError(null);
      if (editingId) {
        await updateProduct(payload);
      } else {
        await addProduct(payload);
      }

      resetForm();
    } catch (submitError) {
      setRequestError(submitError instanceof Error ? submitError.message : 'Failed to save product');
    }
  };

  return (
    <div className="pt-24">
      <div className="container-custom py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-medium">Admin Product Management</h1>
            {adminEmail && <p className="text-sm text-muted-foreground">Logged in as {adminEmail}</p>}
          </div>
          <Button type="button" variant="outline" onClick={logout}>Logout</Button>
        </div>
        <p className="mt-2 text-muted-foreground">Add, update, or remove products and reorder product images.</p>
        {(requestError || error) && (
          <p className="mt-3 text-sm text-destructive">{requestError || error}</p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
              {isLoading && <p className="text-sm text-muted-foreground">Loading from database...</p>}
            </CardHeader>
            <CardContent className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category} • ₹{product.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="icon" variant="outline" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="icon" variant="destructive" onClick={async () => {
                      try {
                        setRequestError(null);
                        await deleteProduct(product.id);
                      } catch (deleteError) {
                        setRequestError(deleteError instanceof Error ? deleteError.message : 'Failed to delete product');
                      }
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{formTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => updateForm('name', e.target.value)} required />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={form.category}
                      onChange={(e) => updateForm('category', e.target.value as Product['category'])}
                    >
                      <option value="summer">summer</option>
                      <option value="semi-winter">semi-winter</option>
                      <option value="winter">winter</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Price</Label>
                    <Input type="number" value={form.price} onChange={(e) => updateForm('price', Number(e.target.value))} required />
                  </div>
                  <div>
                    <Label>Original Price</Label>
                    <Input type="number" value={form.originalPrice ?? ''} onChange={(e) => updateForm('originalPrice', e.target.value ? Number(e.target.value) : undefined)} />
                  </div>
                </div>

                <div>
                  <Label>Short Description</Label>
                  <Input value={form.shortDescription} onChange={(e) => updateForm('shortDescription', e.target.value)} required />
                </div>

                <div>
                  <Label>Full Description</Label>
                  <Textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} required />
                </div>

                <div>
                  <Label>Material</Label>
                  <Input value={form.material} onChange={(e) => updateForm('material', e.target.value)} required />
                </div>

                <div>
                  <Label>Images</Label>
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4" /> Upload images
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {form.images.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        draggable
                        onDragStart={() => handleImageDragStart(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleImageDrop(index)}
                        className="group relative aspect-square overflow-hidden rounded border"
                        title="Drag to reorder"
                      >
                        <img src={image} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                        <span className="absolute right-1 top-1 rounded bg-background/80 p-1 opacity-0 transition group-hover:opacity-100">
                          <GripVertical className="h-3 w-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <Label htmlFor="in-stock">In stock</Label>
                    <Switch id="in-stock" checked={form.inStock} onCheckedChange={(value) => updateForm('inStock', value)} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <Label htmlFor="is-new">Mark as new</Label>
                    <Switch id="is-new" checked={Boolean(form.isNew)} onCheckedChange={(value) => updateForm('isNew', value)} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {isEditMode ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {isEditMode ? 'Update Product' : 'Add Product'}
                  </Button>
                  {isEditMode && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
