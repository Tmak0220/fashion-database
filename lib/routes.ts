export const getBrandUrl = (
    brand: {
      region_slug: string
      country_slug: string
      slug: string
    }
  ) => {
  
    return `/brands/${brand.region_slug}/${brand.country_slug}/${brand.slug}`
  }
  
  export const getDesignerUrl = (
    designer: {
      region_slug: string
      country_slug: string
      slug: string
    }
  ) => {
  
    return `/designers/${designer.region_slug}/${designer.country_slug}/${designer.slug}`
  }