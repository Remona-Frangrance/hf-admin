// src/components/tables/BasicTables/BasicTableOne.tsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button";
import Dialog from "./Dialog";
import Input from "./Input";
import {
  addCategory,
  fetchCategories,
  deleteCategory,
  selectCategories,
  selectCategoriesLoading,
  selectCategoriesError,
  selectCategoriesPagination,
  updateCategory,
} from "../../../redux/slices/categorySlice";
import { AppDispatch } from "../../../redux/slices/store";
import { FiLoader } from 'react-icons/fi';

export default function BasicTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector(selectCategories) || [];
  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);
  const pagination = useSelector(selectCategoriesPagination);

  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentCategory, setCurrentCategory] = useState<null | any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    image: null as File | null,
    description: "",
    previewImage: "",
  });

  useEffect(() => {
    dispatch(fetchCategories({ page, limit: 8 }));
  }, [dispatch, page]);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setFormError("Category name is required");
      return;
    }
    setFormError(null);

    const formData = new FormData();
    formData.append("name", newCategory.name);
    formData.append("description", newCategory.description);
    if (newCategory.image) {
      formData.append("coverImage", newCategory.image);
    }

    try {
      await dispatch(addCategory(formData)).unwrap();
      setIsDialogOpen(false);
      setNewCategory({ name: "", description: "", image: null, previewImage: "" });
    } catch (error) {
      setFormError(error as string);
    }
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory?.name?.trim()) {
      setFormError("Category name is required");
      return;
    }
    setFormError(null);

    const formData = new FormData();
    formData.append("name", currentCategory.name);
    formData.append("description", currentCategory.description || "");
    if (currentCategory.image) {
      formData.append("coverImage", currentCategory.image);
    }

    try {
      await dispatch(updateCategory({ id: currentCategory._id, categoryData: formData })).unwrap();
      setIsEditDialogOpen(false);
      setCurrentCategory(null);
    } catch (error) {
      setFormError(error as string);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await dispatch(deleteCategory(id));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCategory({
        ...newCategory,
        image: file,
        previewImage: URL.createObjectURL(file),
      });
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCurrentCategory({
        ...currentCategory,
        image: file,
        previewImage: URL.createObjectURL(file),
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditDialog = (category: any) => {
    setCurrentCategory({ ...category, image: null, previewImage: category.coverImage });
    setIsEditDialogOpen(true);
  };

  if (loading && categories.length === 0) {
    return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin" size={24} /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <Button onClick={() => setIsDialogOpen(true)}>Add Category</Button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Image
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Description
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="w-16 h-16 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={category.coverImage}
                        alt={category.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                    {category.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                    {category.description || 'N/A'}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        color="primary"
                        onClick={() => openEditDialog(category)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        color="danger"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button 
          disabled={page <= 1} 
          onClick={() => setPage(page - 1)}
          color="secondary"
          size="sm"
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button
          disabled={page >= pagination.totalPages}
          onClick={() => setPage(page + 1)}
          color="secondary"
          size="sm"
        >
          Next
        </Button>
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add New Category"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-2 text-red-500 text-sm bg-red-50 rounded">
              {formError}
            </div>
          )}
          <Input
            label="Category Name"
            placeholder="Enter category name"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
          />

         <div className="space-y-4">
  {/* Enhanced Description Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Description
      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(optional)</span>
    </label>
    <textarea
      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm 
        focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:ring-opacity-50
        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
        px-3 py-2 text-sm transition-all duration-150 ease-in-out
        placeholder-gray-400 dark:placeholder-gray-500"
      placeholder="Enter a detailed description of your category..."
      value={newCategory.description}
      onChange={(e) =>
        setNewCategory({ ...newCategory, description: e.target.value })
      }
      rows={4}
    />
    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
      Maximum 500 characters
    </p>
  </div>

  {/* Enhanced Image Upload Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Category Image
      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(recommended)</span>
    </label>
    
    <div className="flex items-center gap-4">
      <label className="flex flex-col items-center justify-center w-full">
        <div className="
          flex flex-col items-center justify-center w-full h-32
          border-2 border-dashed border-gray-300 dark:border-gray-600
          rounded-lg bg-gray-50 dark:bg-gray-700/50
          hover:bg-gray-100 dark:hover:bg-gray-700/70
          cursor-pointer transition-colors duration-150
        ">
          {newCategory.previewImage ? (
            <div className="relative w-full h-full group">
              <img
                src={newCategory.previewImage}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="
                absolute inset-0 bg-black/30 opacity-0
                group-hover:opacity-100 transition-opacity
                flex items-center justify-center
              ">
                <span className="text-white text-sm font-medium">
                  Change Image
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </label>
    </div>
    
    {newCategory.previewImage && (
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={() => setNewCategory({...newCategory, previewImage: ''})}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Remove Image
        </button>
      </div>
    )}
  </div>
</div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              onClick={() => setIsDialogOpen(false)}
              color="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCategory} 
              color="primary"
              disabled={loading || !newCategory.name.trim()}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Category"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-2 text-red-500 text-sm bg-red-50 rounded">
              {formError}
            </div>
          )}
          <Input
            label="Category Name"
            placeholder="Enter category name"
            value={currentCategory?.name || ''}
            onChange={(e) =>
              setCurrentCategory({ ...currentCategory, name: e.target.value })
            }
          />
<div className="space-y-6">
  {/* Enhanced Description Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Description
      <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">(optional)</span>
    </label>
    <textarea
      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm 
        focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:ring-opacity-50
        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
        px-4 py-2.5 text-sm transition-all duration-150 ease-in-out
        placeholder-gray-400 dark:placeholder-gray-500 min-h-[120px]"
      placeholder="Enter a detailed description of your category..."
      value={currentCategory?.description || ''}
      onChange={(e) =>
        setCurrentCategory({ ...currentCategory, description: e.target.value })
      }
      rows={4}
    />
    <div className="flex justify-between mt-1">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Maximum 500 characters
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {currentCategory?.description?.length || 0}/500
      </p>
    </div>
  </div>

  {/* Enhanced Image Upload Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Category Image
      <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">(recommended)</span>
    </label>
    
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      {/* Image Preview */}
      {currentCategory?.previewImage ? (
        <div className="relative group">
          <div className="w-32 h-32 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            <img
              src={currentCategory.previewImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => setCurrentCategory({...currentCategory, previewImage: ''})}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center 
              opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
            aria-label="Remove image"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700/30">
          <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* Upload Button */}
      <div className="flex-1">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            <svg className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-primary-600 dark:text-primary-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SVG, PNG, JPG (max. 5MB)
            </p>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleEditImageChange} 
            className="hidden" 
          />
        </label>
      </div>
    </div>
  </div>
</div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              onClick={() => setIsEditDialogOpen(false)}
              color="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCategory} 
              color="primary"
              disabled={loading || !currentCategory?.name?.trim()}
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}