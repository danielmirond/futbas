export const FEATURED_MATCH_QUERY = `*[_type == "featuredMatch" && active == true][0]{
  home, away, time, date, competition, channels, ctaUrl, ctaText, override
}`
