export function mergePlaces(publicPlaces, sponsoredPlaces) {
  const combined = [...publicPlaces]

  for (const sponsored of sponsoredPlaces) {
    const sameIndex = combined.findIndex((item) => {
      const hasCoords =
        item.latitude != null &&
        item.longitude != null &&
        sponsored.latitude != null &&
        sponsored.longitude != null

      const sameCoords =
        hasCoords &&
        Number(item.latitude).toFixed(5) === Number(sponsored.latitude).toFixed(5) &&
        Number(item.longitude).toFixed(5) === Number(sponsored.longitude).toFixed(5)

      const sameTitle =
        String(item.title || '').trim().toLowerCase() ===
        String(sponsored.title || '').trim().toLowerCase()

      return sameCoords || sameTitle
    })

    if (sameIndex !== -1) {
      combined[sameIndex] = {
        ...combined[sameIndex],
        ...sponsored,
        source: 'merged',
        is_sponsored: sponsored.is_sponsored,
        is_verified: sponsored.is_verified,
        boost_tier: sponsored.boost_tier ?? 100,
      }
    } else {
      combined.push({
        ...sponsored,
        source: 'sponsored',
      })
    }
  }

  return combined.sort((a, b) => {
    const sponsorDiff = Number(!!b.is_sponsored) - Number(!!a.is_sponsored)
    if (sponsorDiff !== 0) return sponsorDiff

    const boostDiff = (b.boost_tier || 0) - (a.boost_tier || 0)
    if (boostDiff !== 0) return boostDiff

    return 0
  })
}
