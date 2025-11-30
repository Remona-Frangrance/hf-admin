import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';
import Button from '../../ui/button/Button';
import Dialog from '../BasicTables/Dialog';
import Input from '../BasicTables/Input';
import { AppDispatch } from '../../../redux/slices/store';
import { createCatalogItem, deleteCatalogItem, fetchCatalogs, selectCatalogError, selectCatalogLoading, selectCatalogs, updateCatalogItem, CatalogItem } from '../../../redux/slices/catalogSlice';
import { SUPABASE_URL , API_BASE } from '../../../config/api';


export default function CatalogTable() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCatalogs);
  const loading = useSelector(selectCatalogLoading);
  const error = useSelector(selectCatalogError);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  useEffect(() => {
    dispatch(fetchCatalogs());
  }, [dispatch]);

  const signUpload = async (path: string) => {
    const res = await fetch(`${API_BASE}/api/catalog/sign-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (!res.ok) throw new Error('Failed to sign upload');
    return res.json() as Promise<{ path: string; token: string }>;
  };

  const uploadToSignedUrl = async (signed: { path: string; token: string }, file: File) => {
    const url = `${SUPABASE_URL}/storage/v1/object/upload/sign/catalog/${signed.path}?token=${encodeURIComponent(signed.token)}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!res.ok) throw new Error('Upload failed');
    return signed.path;
  };

  const MAX_FILES = 5;
  const MAX_SIZE = 1024 * 1024 * 1024; // 1GB

  const resetForm = () => {
    setTitle('');
    setCoverImage(null);
    setFiles([]);
    setFormError(null);
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }
    setFormError(null);
    setIsSaving(true);

    try {
      if (editingItem) {
        // Edit mode: update only title for now
        await dispatch(updateCatalogItem({ id: editingItem._id, title })).unwrap();
      } else {
        const ts = Date.now();
        let coverPath: string | undefined;
        if (coverImage) {
          if (coverImage.size > MAX_SIZE) {
            setFormError('Cover image exceeds 1GB limit');
            setIsSaving(false);
            return;
          }
          const signed = await signUpload(`catalogs/${ts}/cover-${coverImage.name}`);
          coverPath = await uploadToSignedUrl(signed, coverImage);
        }

        const selected = files.slice(0, MAX_FILES);
        if (files.length > MAX_FILES) {
          setFormError(`You can upload up to ${MAX_FILES} files per catalog.`);
        }
        for (const f of selected) {
          if (f.size > MAX_SIZE) {
            setFormError(`File too large: ${f.name}. Max 1GB per file.`);
            setIsSaving(false);
            return;
          }
        }

        const uploadedFiles: { path: string; size: number; contentType: string }[] = [];
        for (const f of selected) {
          const signed = await signUpload(`catalogs/${ts}/${f.name}`);
          const path = await uploadToSignedUrl(signed, f);
          uploadedFiles.push({ path, size: f.size, contentType: f.type || 'application/octet-stream' });
        }

        await dispatch(createCatalogItem({ title, coverImagePath: coverPath, files: uploadedFiles })).unwrap();
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (e: any) {
      setFormError(e.message || 'Failed to save catalog');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this catalog?')) {
      await dispatch(deleteCatalogItem(id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)} color="primary" className="mb-4">Add Catalog</Button>
      </div>

      {error && <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Cover</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Title</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">File Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Files</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Size</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {items.map((it) => (
                <TableRow key={it._id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="w-16 h-16 overflow-hidden rounded-md bg-gray-100">
                      {it.coverImageUrl ? <img src={it.coverImageUrl} alt={it.title} className="object-cover w-full h-full" /> : null}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{it.title}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{it.files[0] ? it.files[0].path.split('/').pop() : '-'}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{it.files.length}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{Math.round((it.totalSize || 0) / 1024)} KB</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        color="primary"
                        onClick={() => {
                          setEditingItem(it);
                          setTitle(it.title || '');
                          setIsDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" color="danger" onClick={() => handleDelete(it._id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog isOpen={isDialogOpen} onClose={() => { setIsDialogOpen(false); resetForm(); }} title={editingItem ? 'Edit Catalog' : 'Add Catalog'}>
        <div className="space-y-4">
          <Input label="Title" type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
          {!editingItem && (
            <>
              <Input label="Cover Image" type="file" value="" onChange={(e) => setCoverImage(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              <Input label="Files" type="file" value="" multiple onChange={(e) => {
                const list = e.target.files ? Array.from(e.target.files) : [];
                if (list.length > MAX_FILES) {
                  setFormError(`You can upload up to ${MAX_FILES} files per catalog.`);
                }
                const limited = list.slice(0, MAX_FILES);
                const tooLarge = limited.find(f => f.size > MAX_SIZE);
                if (tooLarge) {
                  setFormError(`File too large: ${tooLarge.name}. Max 1GB per file.`);
                }
                setFiles(limited);
              }} />
            </>
          )}
          {formError && <p className="text-red-500 text-sm mt-1">{formError}</p>}
          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={() => { setIsDialogOpen(false); resetForm(); }} color="gray">Cancel</Button>
            <Button onClick={handleSave} color="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
