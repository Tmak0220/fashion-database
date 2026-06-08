export const buildSeasonSlug = (year: string | null, season: string) => {
    if (!season) return null
    return year ? `${year}-${season}` : season
  }
  
  export const buildCollectionSlug = (brand: string | null, season: string | null) => {
    if (!season) return null
    return brand ? `${brand}-${season}` : season
  }