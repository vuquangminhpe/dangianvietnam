import { Search, Filter, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";

interface Category {
  id: string;
  name: string;
}

interface SearchAndFilterProps {
  categories: Category[];
  selectedCategory: string;
  searchTerm: string;
  isLoading: boolean;
  isSearching: boolean;
  onCategoryChange: (categoryId: string) => void;
  onSearchChange: (searchTerm: string) => void;
  onSearchSubmit?: (searchTerm: string) => void;
}

export const SearchAndFilter = ({
  categories,
  selectedCategory,
  searchTerm,
  isLoading,
  isSearching,
  onCategoryChange,
  onSearchChange,
  onSearchSubmit
}: SearchAndFilterProps) => {
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit(searchTerm);
    }
  };

  return (
    <section className="py-8 bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                  selectedCategory === category.id
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm phim..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                disabled={isLoading}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              />
              {isSearching && (
                <Loader2 
                  size={16} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" 
                />
              )}
            </div>
            <Button
              variant="outline"
              className="border-gray-600 text-orange-600 hover:bg-gray-600"
              disabled={isLoading}
            >
              <Filter size={16} className="mr-2" />
              Lọc
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
