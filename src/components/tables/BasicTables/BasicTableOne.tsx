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
  updateCategory
} from "../../../redux/slices/categorySlice";
import { AppDispatch } from "../../../redux/slices/store";

export default function BasicTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector(selectCategories) || [];
  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentCategory, setCurrentCategory] = useState<null | any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    image: null as File | null,
    previewImage: "",
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setFormError("Category name is required");
      return;
    }

    setFormError(null);
    
    const formData = new FormData();
    formData.append("name", newCategory.name);
    if (newCategory.image) {
      formData.append("coverImage", newCategory.image);
    }

    try {
      await dispatch(addCategory(formData)).unwrap();
      setIsDialogOpen(false);
      setNewCategory({
        name: "",
        image: null,
        previewImage: "",
      });
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
    if (currentCategory.image) {
      formData.append("coverImage", currentCategory.image);
    }

    try {
      await dispatch(updateCategory({
        id: currentCategory._id,
        categoryData: formData
      })).unwrap();
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
    setCurrentCategory({
      ...category,
      image: null,
      previewImage: category.coverImage
    });
    setIsEditDialogOpen(true);
  };

  if (loading && categories.length === 0) {
    return <div className="p-4 text-center">Loading categories...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error loading categories: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsDialogOpen(true)}
          color="primary"
          className="mb-4"
        >
          Add Category
        </Button>
      </div>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

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
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                      <img
                        width={40}
                        height={40}
                        src={category.coverImage}
                        alt={category.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {category.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {category.description || 'No description'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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

      {/* Add Category Dialog */}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary-dark"
            />
            {newCategory.previewImage && (
              <div className="mt-2">
                <img
                  src={newCategory.previewImage}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded"
                />
              </div>
            )}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleEditImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary-dark"
            />
            {currentCategory?.previewImage && (
              <div className="mt-2">
                <img
                  src={currentCategory.previewImage}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded"
                />
              </div>
            )}
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