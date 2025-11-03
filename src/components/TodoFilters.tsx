import type { TodoFilter, TodoSort } from '../types/todo';

interface TodoFiltersProps {
  filter: TodoFilter;
  setFilter: (filter: TodoFilter) => void;
  sortBy: TodoSort;
  setSortBy: (sort: TodoSort) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stats: {
    total: number;
    completed: number;
    active: number;
  };
}

/**
 * Todo filters and search component
 */
export function TodoFilters({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  stats,
}: TodoFiltersProps) {
  const filters: { value: TodoFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">{stats.completed}</span> of{' '}
        <span className="font-medium">{stats.total}</span> completed
      </div>

      {/* Search */}
      <div>
        <label htmlFor="search" className="sr-only">
          Search todos
        </label>
        <input
          id="search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search todos..."
          className="input"
          aria-label="Search todos by name or description"
        />
      </div>

      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="Filter todos"
        className="flex gap-2 border-b border-gray-200"
      >
        {filters.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              filter === f.value
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm text-gray-600 font-medium">
          Sort by:
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as TodoSort)}
          className="input py-1 text-sm"
          aria-label="Sort todos"
        >
          <option value="createdAt">Newest first</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
    </div>
  );
}
