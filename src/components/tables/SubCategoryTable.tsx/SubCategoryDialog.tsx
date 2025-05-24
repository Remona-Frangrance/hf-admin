import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/slices/store';
import { addSubcategory, updateSubcategory, setCurrentSubcategory } from '../../../redux/slices/subCategorySlice';
import Dialog from './Dialog';
import Input from './Input';
import Select from './Select';
import Button from '../../ui/button/Button';
import { fetchCategories } from '../../../redux/slices/categorySlice';

interface SubcategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubcategoryDialog({ isOpen, onClose }: SubcategoryDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSubcategory } = useSelector((state: RootState) => state.subcategory);
  const { categories } = useSelector((state: RootState) => state.category);
  const categoriesLoading = useSelector((state: RootState) => state.category.isLoading || false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (currentSubcategory) {
      setName(currentSubcategory.name);
      setDescription(currentSubcategory.description || '');
      setCategoryId(currentSubcategory.category?.id || '');
      setPreviewImages(currentSubcategory.images?.map(img => img.url) || []);
    } else {
      resetForm();
    }
  }, [currentSubcategory]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategoryId('');
    setImages([]);
    setPreviewImages([]);
    setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previewImages];
    URL.revokeObjectURL(newPreviews[index]); // Clean up memory
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('category', categoryId);
    
    images.forEach((image) => {
      formData.append('images', image); 
    });

    try {
      if (currentSubcategory?.id) {
        await dispatch(updateSubcategory({ 
          id: currentSubcategory.id, 
          subcategoryData: formData 
        })).unwrap();
      } else {
        await dispatch(addSubcategory(formData)).unwrap();
      }
      onClose();
      resetForm();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Clean up object URLs
    previewImages.forEach(url => URL.revokeObjectURL(url));
    onClose();
    dispatch(setCurrentSubcategory(null));
    resetForm();
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={currentSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
      size="lg" // Using larger size for better form display
    >
      <div className="space-y-4 p-4">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Name *"
            placeholder="Enter subcategory name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />

          <Input
            label="Description"
            placeholder="Enter description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            textarea
            disabled={isLoading}
          />

          <Select
            label="Category *"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isLoading || categoriesLoading}
            options={[
              { value: '', label: categoriesLoading ? 'Loading categories...' : 'Select a category' },
              ...categories.map(cat => ({ 
                value: cat._id, 
                label: cat.name 
              }))
            ]}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images (Maximum 5 files)
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
                Select Images
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                multiple
                max={5}
                className="hidden"
                disabled={isLoading || previewImages.length >= 5}
              />
            </label>
            <span className="text-sm text-gray-500">
              {previewImages.length} / 5 images selected
            </span>
          </div>
        </div>

        {previewImages.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {previewImages.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-32 w-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6">
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={isLoading}
            className="min-w-[80px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            disabled={isLoading || !name || !categoryId}
            className="min-w-[80px]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}