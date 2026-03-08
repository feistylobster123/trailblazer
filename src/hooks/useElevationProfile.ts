import { useMemo } from 'react'
import type { CourseData } from '@/types/race'

interface ElevationStats {
  totalGain: number
  totalLoss: number
  highPoint: number
  lowPoint: number
  avgGrade: number
  maxGrade: number
}

export function useElevationProfile(courseData?: CourseData | null) {
  return useMemo<ElevationStats | null>(() => {
    if (!courseData || !courseData.elevationProfile || courseData.elevationProfile.length === 0) {
      return null
    }

    const points = courseData.elevationProfile
    let totalGain = 0
    let totalLoss = 0
    let highPoint = points[0].elevationM
    let lowPoint = points[0].elevationM
    let maxGrade = 0

    for (let i = 1; i < points.length; i++) {
      const diff = points[i].elevationM - points[i - 1].elevationM
      if (diff > 0) totalGain += diff
      else totalLoss += Math.abs(diff)

      if (points[i].elevationM > highPoint) highPoint = points[i].elevationM
      if (points[i].elevationM < lowPoint) lowPoint = points[i].elevationM
      if (Math.abs(points[i].grade) > Math.abs(maxGrade)) maxGrade = points[i].grade
    }

    const totalDistKm = points[points.length - 1].distanceKm - points[0].distanceKm
    const avgGrade = totalDistKm > 0
      ? ((totalGain - totalLoss) / (totalDistKm * 1000)) * 100
      : 0

    return { totalGain, totalLoss, highPoint, lowPoint, avgGrade, maxGrade }
  }, [courseData])
}
