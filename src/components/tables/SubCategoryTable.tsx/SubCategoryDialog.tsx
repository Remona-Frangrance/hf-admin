import { useState, useEffect, useRef } from 'react';
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

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

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
  console.log("🚀 ~ SubcategoryDialog ~ previewImages:", previewImages)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

 useEffect(() => {
  if (currentSubcategory) {
    setName(currentSubcategory.name);
    setDescription(currentSubcategory.description || '');
    setCategoryId(currentSubcategory.category?.id || '');

    // Clear previous previews and images when editing
    setPreviewImages([]);
    setImages([]);

    // ✅ Fix here: assign string URLs directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingPreviews = (currentSubcategory.images || []).map((img: any) =>
      typeof img === 'string' ? img : img.url
    );
    console.log("🚀 ~ useEffect ~ currentSubcategory.images:", currentSubcategory?.images);
    setPreviewImages(existingPreviews);
  } else {
    resetForm();
  }
}, [currentSubcategory]);


  const resetForm = () => {
    setName('');
    setDescription('');
    setCategoryId('');
    setImages([]);
    // Clean up object URLs
    previewImages.forEach(url => URL.revokeObjectURL(url));
    setPreviewImages([]);
    setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    
    // Validate files
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Limit to 5 images total
    const remainingSlots = MAX_IMAGES - (previewImages.length - (currentSubcategory?.images?.length || 0));
    const newFiles = validFiles.slice(0, remainingSlots);
    
    if (newFiles.length < validFiles.length) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
    }

    setImages(prev => [...prev, ...newFiles]);
    
    // Create previews for new files only
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    // Determine if we're removing an existing image or a new upload
    const existingImageCount = currentSubcategory?.images?.length || 0;
    
    if (index < existingImageCount) {
      // For existing images, we just remove from preview (actual deletion handled in backend)
      const newPreviews = [...previewImages];
      newPreviews.splice(index, 1);
      setPreviewImages(newPreviews);
    } else {
      // For new uploads, remove from both images and previews
      const adjustedIndex = index - existingImageCount;
      const newImages = [...images];
      newImages.splice(adjustedIndex, 1);
      setImages(newImages);

      const newPreviews = [...previewImages];
      URL.revokeObjectURL(newPreviews[index]); // Clean up memory
      newPreviews.splice(index, 1);
      setPreviewImages(newPreviews);
    }
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
  formData.append('keepExistingImages', 'true'); // This tells backend to preserve some old images

  // Append new images
  images.forEach((image) => {
    formData.append('images', image);
  });

  // Calculate and send which existing images to keep
  // Map existing images to their URL strings for comparison
  const existingImageUrls = (currentSubcategory?.images || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (img: any) => typeof img === 'string' ? img : img.url
  );
  const remainingImageUrls = previewImages.filter(url => existingImageUrls.includes(url));

  remainingImageUrls.forEach(url => {
    formData.append('existingImagesToKeep', url); // This will send as array
  });

  try {
    if (currentSubcategory?._id) {
      await dispatch(updateSubcategory({
        id: String(currentSubcategory._id),
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

  const triggerFileInput = () => {
    if (fileInputRef.current && previewImages.length < MAX_IMAGES) {
      fileInputRef.current.click();
    }
  };

  // Calculate how many images can still be added
  const remainingImageSlots = MAX_IMAGES - previewImages.length;

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={currentSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
      size="xl"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Name *"
              placeholder="Enter subcategory name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />

            <Input
              label="Description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="w-full"
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
              className="w-full"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Images
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                (Maximum {MAX_IMAGES} files, {MAX_FILE_SIZE / (1024 * 1024)}MB each)
              </span>
            </label>
            
            {/* Image Upload and Preview Area */}
            <div className="space-y-4">
              {/* Preview Grid */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <div className="h-full w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/150?text=Image+Error';
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white/90 dark:bg-gray-700/90 text-red-500 dark:text-red-400 rounded-full w-6 h-6 flex items-center justify-center 
                          hover:bg-red-500 hover:text-white transition-all shadow-sm
                          dark:hover:bg-red-600"
                        disabled={isLoading}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <div 
                onClick={triggerFileInput}
                className={`
                  flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4
                  ${remainingImageSlots <= 0 ? 
                    'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 cursor-not-allowed' : 
                    'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 hover:border-primary-500 dark:hover:border-primary-400 cursor-pointer'
                  }
                  transition-colors
                `}
              >
                <div className="flex flex-col items-center text-center">
                  <svg className={`w-8 h-8 mb-2 ${remainingImageSlots <= 0 ? 'text-gray-400 dark:text-gray-500' : 'text-primary-500 dark:text-primary-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <h4 className={`text-sm font-medium ${remainingImageSlots <= 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {previewImages.length > 0 ? 'Add more images' : 'Upload images'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {remainingImageSlots <= 0 ? 
                      'Maximum files reached' : 
                      `Click to browse or drag and drop (${remainingImageSlots} remaining)`
                    }
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                  className="hidden"
                  disabled={isLoading || remainingImageSlots <= 0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer with action buttons */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isLoading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !name || !categoryId}
              className="min-w-[100px]"
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
      </div>
    </Dialog>
  );
}