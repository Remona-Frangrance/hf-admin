// src/components/tables/BasicTables/GalleryTable.tsx
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
import Dialog from "../BasicTables/Dialog";
import Input from "../BasicTables/Input";
import { 
  addGalleryItem, 
  fetchGallery, 
  deleteGalleryItem,
  selectGallery, 
  selectGalleryLoading, 
  selectGalleryError, 
  updateGalleryItem
} from "../../../redux/slices/gallerySlice";
import { AppDispatch } from "../../../redux/slices/store";
import { FiLoader } from 'react-icons/fi';

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  subcategory?: string;
}

export default function GalleryTable() {
  const dispatch = useDispatch<AppDispatch>();
  const galleryItems = useSelector(selectGallery) || [];
  const loading = useSelector(selectGalleryLoading);
  const error = useSelector(selectGalleryError);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<GalleryItem & { newImages?: File[]; previews: string[] } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<{
    title: string;
    description: string;
    subcategory: string;
    images: File[];
    previews: string[];
  }>({
    title: "",
    description: "",
    subcategory: "",
    images: [],
    previews: [],
  });

  useEffect(() => {
    dispatch(fetchGallery());
  }, [dispatch]);

  const handleAddItem = async () => {
    if (!newItem.title.trim()) {
      setFormError("Title is required");
      return;
    }

    setFormError(null);
    
    const formData = new FormData();
    formData.append("title", newItem.title);
    formData.append("description", newItem.description);
    formData.append("subcategory", newItem.subcategory);
    newItem.images.forEach((file) => formData.append("images", file));

    try {
      await dispatch(addGalleryItem(formData)).unwrap();
      setIsDialogOpen(false);
      setNewItem({
        title: "",
        description: "",
        subcategory: "",
        images: [],
        previews: [],
      });
    } catch (error) {
      setFormError(error as string);
    }
  };

  const handleUpdateItem = async () => {
    if (!currentItem?.title?.trim()) {
      setFormError("Title is required");
      return;
    }

    setFormError(null);

    const formData = new FormData();
    formData.append("title", currentItem.title);
    formData.append("description", currentItem.description || "");
    formData.append("subcategory", currentItem.subcategory || "");
    if (currentItem && currentItem.newImages) {
      currentItem.newImages.forEach((file: File) => formData.append("images", file));
    }

    try {
      await dispatch(updateGalleryItem({
        id: currentItem._id,
        formData
      })).unwrap();
      setIsEditDialogOpen(false);
      setCurrentItem(null);
    } catch (error) {
      setFormError(error as string);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await dispatch(deleteGalleryItem(id));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (files.length > 15) {
        setFormError("You can upload a maximum of 15 images at once.");
      }
      const limited = files.slice(0, 15);
      const previews = limited.map((file) => URL.createObjectURL(file));
      setNewItem({
        ...newItem,
        images: limited,
        previews,
      });
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && currentItem) {
      const files = Array.from(e.target.files);
      const limited = files.slice(0, 15);
      const newPreviews = limited.map((file) => URL.createObjectURL(file));
      setCurrentItem({
        ...currentItem,
        newImages: limited,
        previews: [...(currentItem.images || []), ...newPreviews],
      });
    }
  };

  const openEditDialog = (item: GalleryItem) => {
    setCurrentItem({
      ...item,
      newImages: [],
      previews: item.images || [],
    });
    setIsEditDialogOpen(true);
  };

  if (loading && galleryItems.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-gray-600">
        <FiLoader className="animate-spin text-3xl mb-2" />
        <span className="text-sm">Fetching gallery items...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error loading gallery items: {error}
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
          Add Gallery Item
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
                  Title
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Subcategory
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
              {galleryItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex -space-x-2">
                      {(item.images || []).slice(0, 3).map((img, index) => (
                        <div key={index} className="w-8 h-8 overflow-hidden rounded-full border-2 border-white">
                          <img
                            src={img}
                            alt={`Gallery ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                      {item.images && item.images.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                          +{item.images.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.subcategory || 'No subcategory'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.description || 'No description'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        color="primary"
                        onClick={() => openEditDialog(item)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        color="danger"
                        onClick={() => handleDeleteItem(item._id)}
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

      {/* Add Item Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add New Gallery Item"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            type="text"
            placeholder="Enter title"
            value={newItem.title}
            onChange={(e) =>
              setNewItem({ ...newItem, title: e.target.value })
            }
          />

          <Input
            label="Subcategory"
            type="text"
            placeholder="Enter subcategory"
            value={newItem.subcategory}
            onChange={(e) =>
              setNewItem({ ...newItem, subcategory: e.target.value })
            }
          />

          <Input
            label="Description"
            type="text"
            placeholder="Enter description"
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
          />

          <Input
            label="Images"
            type="file"
            multiple
            value=""
            onChange={handleImageChange}
          />
          {newItem.previews.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {newItem.previews.map((src, index) => (
                <div key={index} className="w-20 h-20 rounded-md overflow-hidden border border-gray-300">
                  <img src={src} alt={`Preview ${index + 1}`} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          )}

          {formError && (
            <p className="text-red-500 text-sm mt-1">{formError}</p>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              onClick={() => setIsDialogOpen(false)}
              color="gray"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddItem}
              color="primary"
              disabled={loading}
            >
              {loading ? <FiLoader className="animate-spin" /> : "Add"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setCurrentItem(null);
          setFormError(null);
        }}
        title="Edit Gallery Item"
      >
        {currentItem && (
          <div className="space-y-4">
            <Input
              label="Title"
              type="text"
              placeholder="Enter title"
              value={currentItem.title}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, title: e.target.value })
              }
            />

            <Input
              label="Subcategory"
              type="text"
              placeholder="Enter subcategory"
              value={currentItem.subcategory || ""}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, subcategory: e.target.value })
              }
            />

            <Input
              label="Description"
              type="text"
              placeholder="Enter description"
              value={currentItem.description || ""}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, description: e.target.value })
              }
            />

            <Input
              label="Images"
              type="file"
              multiple
              value=""
              onChange={handleEditImageChange}
            />
            {currentItem.previews && currentItem.previews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {currentItem.previews.map((src, index) => (
                  <div key={index} className="w-20 h-20 rounded-md overflow-hidden border border-gray-300">
                    <img src={src} alt={`Preview ${index + 1}`} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}

            {formError && (
              <p className="text-red-500 text-sm mt-1">{formError}</p>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setCurrentItem(null);
                  setFormError(null);
                }}
                color="gray"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateItem}
                color="primary"
                disabled={loading}
              >
                {loading ? <FiLoader className="animate-spin" /> : "Update"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
