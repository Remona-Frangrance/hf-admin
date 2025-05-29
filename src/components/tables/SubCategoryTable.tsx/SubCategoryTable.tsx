import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/slices/store';
import { useAppDispatch } from '../../../redux/hooks';
import { 
  fetchSubcategories, 
  deleteSubcategory, 
  setCurrentSubcategory 
} from '../../../redux/slices/subCategorySlice';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Button from '../../ui/button/Button';
import SubcategoryDialog from './SubCategoryDialog';
import { FiLoader } from 'react-icons/fi';

export default function SubcategoriesTable() {
  const dispatch = useAppDispatch();
  const subcategories = useSelector((state: RootState) => state.subcategory.subcategories);
  const loading = useSelector((state: RootState) => state.subcategory.loading);
  const error = useSelector((state: RootState) => state.subcategory.error);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSubcategories());
  }, [dispatch]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (subcategory: any) => {
    dispatch(setCurrentSubcategory(subcategory));
    setIsDialogOpen(true);
  };

  const handleDelete = async (_id: string) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await dispatch(deleteSubcategory(_id)).unwrap();
        // No need to reload, Redux state will update automatically
      } catch (error) {
        console.error('Failed to delete subcategory:', error);
      }
    }
  };

  if (loading && subcategories.length === 0) {
   return (
    <div className="p-6 flex flex-col items-center justify-center text-gray-600">
      <FiLoader className="animate-spin text-3xl mb-2" />
      <span className="text-sm">Fetching subcategories...</span>
    </div>
  );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error loading subcategories: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            dispatch(setCurrentSubcategory(null));
            setIsDialogOpen(true);
          }}
          color="primary"
          className="mb-4"
        >
          Add Subcategory
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
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Category
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Images
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {subcategories.map((subcategory) => (
                <TableRow key={subcategory._id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                    {subcategory.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                    {subcategory.category?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex -space-x-2">
                      {subcategory.images.slice(0, 3).map((imageObj, index) => (
                        <div key={index} className="w-8 h-8 overflow-hidden rounded-full border-2 border-white">
                          <img
                            src={typeof imageObj === 'string' ? imageObj : imageObj.url}
                            alt={`Subcategory ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                      {subcategory.images.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                          +{subcategory.images.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        color="primary"
                        onClick={() => handleEdit(subcategory)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        color="danger"
                        onClick={() => {
                          if (typeof subcategory._id === 'string') {
                            handleDelete(subcategory._id);
                          } else {
                            console.error('Invalid subcategory id:', subcategory._id);
                          }
                        }}
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

      <SubcategoryDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </div>
  );
}