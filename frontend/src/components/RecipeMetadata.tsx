interface RecipeMetadataProps {
  prepTime: string;
  cookTime: string;
  tags: string[];
  origin: string;
  onPrepTimeChange: (time: string) => void;
  onCookTimeChange: (time: string) => void;
  onTagsChange: (tags: string[]) => void;
  onOriginChange: (origin: string) => void;
}

export default function RecipeMetadata({
  prepTime,
  cookTime,
  tags,
  origin,
  onPrepTimeChange,
  onCookTimeChange,
  onTagsChange,
  onOriginChange,
}: RecipeMetadataProps) {
  const availableTags = [
    "Végétarien",
    "Vegan",
    "Sans gluten",
    "Sans lactose",
    "Facile",
    "Rapide",
    "Économique",
    "Festif",
  ];

  const countries = [
    "France",
    "Italie",
    "Espagne",
    "Japon",
    "Chine",
    "Inde",
    "Mexique",
    "Thaïlande",
    "Grèce",
    "Maroc",
    "États-Unis",
    "Autre",
  ];

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <h3 className="text-gray-700 font-semibold text-lg">Informations</h3>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Temps de préparation
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={prepTime}
            onChange={(e) => onPrepTimeChange(e.target.value)}
            placeholder="30"
            className="w-24 px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-teal-400"
            min="0"
          />
          <span className="text-sm text-gray-600">minutes</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Temps de cuisson
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={cookTime}
            onChange={(e) => onCookTimeChange(e.target.value)}
            placeholder="45"
            className="w-24 px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-teal-400"
            min="0"
          />
          <span className="text-sm text-gray-600">minutes</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Tags du plat
        </label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                tags.includes(tag)
                  ? "bg-teal-400 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {tags.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Sélectionné: {tags.join(", ")}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Pays d'origine
        </label>
        <select
          value={origin}
          onChange={(e) => onOriginChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-teal-400"
        >
          <option value="">Sélectionner un pays...</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
