/** Shop sidebar / filter “type” rows (collection or synthetic facets). */
export type ShopTypeFacetRow = {
  id: string;
  label: string;
  count: number;
};

export type ShopCategoryFilter = {
  slug: string | null;
  label: string;
  href?: string;
};

export type ShopFacetSummary = {
  catalogMaxPrice: number;
  typeRows: ShopTypeFacetRow[];
};
