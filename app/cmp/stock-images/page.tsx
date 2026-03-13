'use client';

import { useState } from 'react';
import { Box, Badge } from '@optiaxiom/react';
import { Text } from '@/app/components/Text';
import { Input } from '@/app/components/Input';
import { Button } from '@/app/components/Button';
import { IconSearch as Search, IconDownload as Download, IconChevronLeft as ChevronLeft, IconChevronRight as ChevronRight } from '@tabler/icons-react';

interface StockImage {
  id: number;
  title: string;
  photographer: string;
  category: string;
}

const categories = [
  'Nature',
  'Business',
  'Technology',
  'People',
  'Food',
  'Architecture',
  'Travel',
  'Abstract',
];

const stockImages: StockImage[] = [
  { id: 1, title: 'Mountain Landscape', photographer: 'John Smith', category: 'Nature' },
  { id: 2, title: 'Office Team Meeting', photographer: 'Sarah Johnson', category: 'Business' },
  { id: 3, title: 'Tech Workspace', photographer: 'Alex Chen', category: 'Technology' },
  { id: 4, title: 'Portrait Study', photographer: 'Emma Williams', category: 'People' },
  { id: 5, title: 'Food Photography', photographer: 'Marcus Brown', category: 'Food' },
  { id: 6, title: 'Modern Building', photographer: 'Lisa Anderson', category: 'Architecture' },
  { id: 7, title: 'Beach Sunset', photographer: 'James Taylor', category: 'Travel' },
  { id: 8, title: 'Abstract Colors', photographer: 'Nina Patel', category: 'Abstract' },
  { id: 9, title: 'Forest Path', photographer: 'Daniel Lee', category: 'Nature' },
  { id: 10, title: 'City Skyline', photographer: 'Rachel White', category: 'Travel' },
  { id: 11, title: 'Modern Office', photographer: 'Tom Harris', category: 'Business' },
  { id: 12, title: 'Geometric Patterns', photographer: 'Sophie Martin', category: 'Abstract' },
];

export default function StockImagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const imagesPerPage = 12;

  const filteredImages = stockImages.filter((image) => {
    const matchesSearch =
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.photographer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || image.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const paginatedImages = filteredImages.slice(startIndex, startIndex + imagesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Stock Images
          </h1>
          <p className="text-lg text-slate-600">
            Browse free stock images
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Input
            type="text"
            placeholder="Search by title or photographer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 bg-white shadow-sm"
          />
          <Search
            size={20}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <Text className="text-sm text-slate-600 mb-6">
          Showing {paginatedImages.length > 0 ? startIndex + 1 : 0} to{' '}
          {Math.min(startIndex + imagesPerPage, filteredImages.length)} of{' '}
          {filteredImages.length} images
        </Text>

        {/* Image Grid */}
        {paginatedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedImages.map((image) => (
              <Box
                key={image.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Image Placeholder */}
                <div className="relative bg-gradient-to-br from-slate-200 to-slate-300 w-full h-48 overflow-hidden group">
                  <img
                    src={`https://picsum.photos/400/300?random=${image.id}`}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Download Button Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-2">
                      <Download size={18} />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {image.title}
                  </h3>
                  <Text className="text-sm text-slate-600 mb-3">
                    by {image.photographer}
                  </Text>
                  <Badge variant="subtle" className="text-xs">
                    {image.category}
                  </Badge>
                </div>
              </Box>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center mb-8">
            <Text className="text-slate-600 text-lg">
              No images found matching your search criteria.
            </Text>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:border-blue-500'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={18} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
