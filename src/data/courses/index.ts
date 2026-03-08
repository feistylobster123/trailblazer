import type { CourseData } from '@/types/race'
import { westernStatesCourse } from './western-states'
import { utmbCourse } from './utmb'
import { hardrockCourse } from './hardrock'
import { leadvilleCourse } from './leadville'
import { generateCourseData, getCourseType } from './generate-course'
import { races } from '@/data/races'

// Handcrafted course data for iconic races
const handcraftedCourses: Record<string, CourseData> = {
  'western-states-100': westernStatesCourse,
  'utmb': utmbCourse,
  'hardrock-100': hardrockCourse,
  'leadville-100': leadvilleCourse,
}

// Cache for generated courses (computed lazily)
const generatedCourseCache: Record<string, CourseData> = {}

export function getCourseData(raceId: string): CourseData | null {
  // Return handcrafted data if available
  if (handcraftedCourses[raceId]) {
    return handcraftedCourses[raceId]
  }

  // Check cache for previously generated data
  if (generatedCourseCache[raceId]) {
    return generatedCourseCache[raceId]
  }

  // Generate course data from race properties
  const race = races.find(r => r.id === raceId || r.slug === raceId)
  if (!race) return null

  const courseData = generateCourseData({
    id: race.id,
    name: race.name,
    distanceMi: race.distanceMi,
    elevationGainFt: race.elevationGainFt,
    lat: race.coordinates.lat,
    lng: race.coordinates.lng,
    startElevationFt: race.coordinates.elevationFt ?? 2000,
    courseType: getCourseType(race.id, race.tags),
    difficulty: race.difficulty,
  })

  // Cache it so it's stable across calls
  generatedCourseCache[raceId] = courseData
  return courseData
}

export function getAllCourseIds(): string[] {
  // Return all race IDs since we can now generate data for any race
  return races.map(r => r.id)
}
