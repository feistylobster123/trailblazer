import type { CourseData } from '@/types/race'
import { westernStatesCourse } from './western-states'
import { utmbCourse } from './utmb'
import { hardrockCourse } from './hardrock'
import { leadvilleCourse } from './leadville'

const courses: Record<string, CourseData> = {
  'western-states-100': westernStatesCourse,
  'utmb': utmbCourse,
  'hardrock-100': hardrockCourse,
  'leadville-100': leadvilleCourse,
}

export function getCourseData(raceId: string): CourseData | null {
  return courses[raceId] || null
}

export function getAllCourseIds(): string[] {
  return Object.keys(courses)
}
