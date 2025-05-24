import { useEffect, useState } from 'react';
import {  useSelector } from 'react-redux';
import { RootState  } from '../../../redux/slices/store';
import { useAppDispatch } from '../../../redux/hooks';
import { fetchSubcategories, deleteSubcategory, setCurrentSubcategory } from '../../../redux/slices/subCategorySlice';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Button from '../../ui/button/Button';
import SubcategoryDialog from './SubCategoryDialog';


export default function SubcategoriesTable() {
const dispatch = useAppDispatch();
const subcategories = useSelector((state: RootState) => state.subcategory.subcategories);
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
      await dispatch(deleteSubcategory(_id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Subcategories</h3>
        <Button 
          onClick={() => {
            dispatch(setCurrentSubcategory(null));
            setIsDialogOpen(true);
          }}
          color="primary"
          className="mb-4"
        >
          Add New Subcategory
        </Button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Name</TableCell>
              <TableCell isHeader>Category</TableCell>
              <TableCell isHeader>Images</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcategories.map((subcategory) => (
              <TableRow key={subcategory._id}>
                <TableCell>{subcategory.name}</TableCell>
                <TableCell>{subcategory.category?.name || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {subcategory.images.slice(0, 3).map((imageObj, index) => (
                        <img
                          key={index}
                          src={typeof imageObj === 'string' ? imageObj : imageObj.url}
                          alt={`Subcategory ${index + 1}`}
                          className="w-8 h-8 rounded-full border-2 border-white"
                        />
                    ))}
                    {subcategory.images.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                        +{subcategory.images.length - 3}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color={subcategory.status === 'Active' ? 'success' : 'error'}>
                    {subcategory.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      color="secondary"
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

      <SubcategoryDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </div>
  );
}