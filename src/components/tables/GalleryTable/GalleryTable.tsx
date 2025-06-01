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
  imageUrl: string;
  subcategory?: string;
}

export default function GalleryTable() {
  const dispatch = useDispatch<AppDispatch>();
  const galleryItems = useSelector(selectGallery) || [];
  const loading = useSelector(selectGalleryLoading);
  const error = useSelector(selectGalleryError);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<GalleryItem & { image?: File | null; previewImage: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<{
    title: string;
    description: string;
    subcategory: string;
    image: File | null;
    previewImage: string;
  }>({
    title: "",
    description: "",
    subcategory: "",
    image: null,
    previewImage: "",
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
    if (newItem.image) {
      formData.append("image", newItem.image);
    }

    try {
      await dispatch(addGalleryItem(formData)).unwrap();
      setIsDialogOpen(false);
      setNewItem({
        title: "",
        description: "",
        subcategory: "",
        image: null,
        previewImage: "",
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
    if (currentItem.image) {
      formData.append("image", currentItem.image);
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewItem({
        ...newItem,
        image: file,
        previewImage: URL.createObjectURL(file),
      });
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCurrentItem({
        ...currentItem!,
        image: file,
        previewImage: URL.createObjectURL(file),
      });
    }
  };

  const openEditDialog = (item: GalleryItem) => {
    setCurrentItem({
      ...item,
      image: null,
      previewImage: item.imageUrl,
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
                    <div className="w-16 h-16 overflow-hidden rounded-md">
                      <img
                        width={64}
                        height={64}
                        src={item.imageUrl}
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
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
            label="Image"
            type="file"
            value=""
            onChange={handleImageChange}
          />

          {newItem.previewImage && (
            <div className="mt-2 w-24 h-24 rounded-md overflow-hidden border border-gray-300">
              <img
                src={newItem.previewImage}
                alt="Preview"
                className="object-cover w-full h-full"
              />
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
              label="Image"
              type="file"
              value=""
              onChange={handleEditImageChange}
            />
        
            {currentItem.previewImage && (
              <div className="mt-2 w-24 h-24 rounded-md overflow-hidden border border-gray-300">
                <img
                  src={currentItem.previewImage}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
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
