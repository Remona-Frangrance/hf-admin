export interface Subcategory {
  _id: string;            // required for React keys and identifying items
  name: string;
  images: (string | SubcategoryImage)[];  // see next section for fix
  status: 'Active' | 'Inactive';
  category: {
    _id: string;
    name: string;
  } | null;
}

// If images are objects, define the SubcategoryImage interface
export interface SubcategoryImage {
  url: string;  // or the exact property your backend uses
  // other properties if any
}
