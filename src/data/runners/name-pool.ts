// Realistic runner name generation with demographic distributions
// Reflects ultrarunning demographics: ~60/40 male/female, age bell curve centered ~40

import { seededChoice, seededGaussian, seededRandom } from './prng'

const MALE_FIRST_NAMES = [
  // American
  'James', 'John', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Thomas',
  'Daniel', 'Matthew', 'Christopher', 'Andrew', 'Joseph', 'Brian', 'Kevin',
  'Jason', 'Ryan', 'Eric', 'Mark', 'Steven', 'Timothy', 'Jeffrey', 'Scott',
  'Patrick', 'Nathan', 'Kyle', 'Brandon', 'Adam', 'Tyler', 'Cody',
  'Justin', 'Travis', 'Dustin', 'Derek', 'Caleb', 'Seth', 'Jake',
  // European
  'Lars', 'Erik', 'Magnus', 'Henrik', 'Anders', 'Bjorn', 'Sven',
  'Pierre', 'Jean', 'Francois', 'Luc', 'Antoine',
  'Hans', 'Klaus', 'Stefan', 'Wolfgang', 'Dieter',
  'Marco', 'Luca', 'Alessandro', 'Matteo', 'Giorgio',
  'Pablo', 'Carlos', 'Miguel', 'Javier', 'Diego',
  // International
  'Hiroshi', 'Takeshi', 'Kenji', 'Yuki',
  'Wei', 'Jun', 'Hao',
  'Raj', 'Vikram', 'Arun',
  'Kofi', 'Kwame', 'Tendai',
  'Mateo', 'Santiago', 'Andres',
]

const FEMALE_FIRST_NAMES = [
  // American
  'Mary', 'Jennifer', 'Jessica', 'Sarah', 'Emily', 'Amanda', 'Ashley',
  'Elizabeth', 'Megan', 'Lauren', 'Rachel', 'Stephanie', 'Nicole', 'Rebecca',
  'Katherine', 'Christine', 'Lisa', 'Michelle', 'Amy', 'Heather',
  'Courtney', 'Kelly', 'Brittany', 'Kimberly', 'Kristen', 'Andrea',
  'Laura', 'Hannah', 'Samantha', 'Allison', 'Natalie', 'Brooke',
  // European
  'Astrid', 'Ingrid', 'Frida', 'Sigrid', 'Elsa',
  'Marie', 'Claire', 'Sophie', 'Camille', 'Eloise',
  'Anna', 'Katrin', 'Heidi', 'Greta', 'Lena',
  'Chiara', 'Giulia', 'Francesca', 'Elena', 'Sofia',
  'Isabel', 'Carmen', 'Lucia', 'Ana', 'Rosa',
  // International
  'Yuko', 'Sakura', 'Mei', 'Aiko',
  'Li', 'Xin', 'Ying',
  'Priya', 'Ananya', 'Deepa',
  'Amara', 'Nia', 'Zara',
  'Valentina', 'Catalina', 'Mariana',
]

const LAST_NAMES = [
  // American/English
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller',
  'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White',
  'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
  'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Hill', 'Scott', 'Green', 'Adams',
  'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts',
  'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards',
  'Collins', 'Stewart', 'Morris', 'Murphy',
  // Scandinavian
  'Johansson', 'Lindqvist', 'Eriksson', 'Nystrom', 'Bergstrom',
  'Olsen', 'Hansen', 'Larsen', 'Pedersen',
  // French
  'Dubois', 'Moreau', 'Laurent', 'Lefebvre', 'Leroy',
  // German
  'Mueller', 'Schmidt', 'Schneider', 'Fischer', 'Weber',
  // Italian
  'Rossi', 'Russo', 'Esposito', 'Bianchi', 'Romano',
  // Spanish
  'Hernandez', 'Lopez', 'Gonzalez', 'Sanchez', 'Ramirez',
  // Japanese
  'Tanaka', 'Yamamoto', 'Watanabe', 'Suzuki', 'Takahashi',
  // Chinese
  'Chen', 'Wang', 'Zhang', 'Liu', 'Yang',
  // Indian
  'Patel', 'Sharma', 'Singh', 'Gupta', 'Kumar',
  // African
  'Okafor', 'Mensah', 'Ndlovu', 'Diallo',
  // Latin American
  'Vasquez', 'Morales', 'Castillo', 'Reyes', 'Cruz',
]

const US_CITIES: Array<{ city: string; state: string }> = [
  { city: 'Boulder', state: 'CO' },
  { city: 'Flagstaff', state: 'AZ' },
  { city: 'Asheville', state: 'NC' },
  { city: 'Portland', state: 'OR' },
  { city: 'Seattle', state: 'WA' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'Denver', state: 'CO' },
  { city: 'Salt Lake City', state: 'UT' },
  { city: 'Bend', state: 'OR' },
  { city: 'Durango', state: 'CO' },
  { city: 'Chattanooga', state: 'TN' },
  { city: 'Bozeman', state: 'MT' },
  { city: 'Missoula', state: 'MT' },
  { city: 'Leadville', state: 'CO' },
  { city: 'Silverton', state: 'CO' },
  { city: 'Squaw Valley', state: 'CA' },
  { city: 'Lake Tahoe', state: 'CA' },
  { city: 'Moab', state: 'UT' },
  { city: 'Bellingham', state: 'WA' },
  { city: 'Reno', state: 'NV' },
  { city: 'Colorado Springs', state: 'CO' },
  { city: 'Tucson', state: 'AZ' },
  { city: 'Albuquerque', state: 'NM' },
  { city: 'Austin', state: 'TX' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Knoxville', state: 'TN' },
  { city: 'Charlottesville', state: 'VA' },
  { city: 'Rochester', state: 'NY' },
  { city: 'Burlington', state: 'VT' },
  { city: 'Ithaca', state: 'NY' },
  { city: 'Madison', state: 'WI' },
  { city: 'Minneapolis', state: 'MN' },
  { city: 'Anchorage', state: 'AK' },
  { city: 'Honolulu', state: 'HI' },
  { city: 'Boise', state: 'ID' },
  { city: 'Jackson', state: 'WY' },
]

const INTERNATIONAL_CITIES: Array<{ city: string; state: string; country: string }> = [
  { city: 'Chamonix', state: 'Haute-Savoie', country: 'France' },
  { city: 'Innsbruck', state: 'Tyrol', country: 'Austria' },
  { city: 'Zermatt', state: 'Valais', country: 'Switzerland' },
  { city: 'Cortina', state: 'Veneto', country: 'Italy' },
  { city: 'Barcelona', state: 'Catalonia', country: 'Spain' },
  { city: 'Stockholm', state: 'Stockholm', country: 'Sweden' },
  { city: 'Oslo', state: 'Oslo', country: 'Norway' },
  { city: 'Munich', state: 'Bavaria', country: 'Germany' },
  { city: 'London', state: 'England', country: 'United Kingdom' },
  { city: 'Vancouver', state: 'BC', country: 'Canada' },
  { city: 'Queenstown', state: 'Otago', country: 'New Zealand' },
  { city: 'Melbourne', state: 'Victoria', country: 'Australia' },
  { city: 'Cape Town', state: 'Western Cape', country: 'South Africa' },
  { city: 'Tokyo', state: 'Tokyo', country: 'Japan' },
  { city: 'Mexico City', state: 'CDMX', country: 'Mexico' },
  { city: 'Bogota', state: 'Cundinamarca', country: 'Colombia' },
  { city: 'Santiago', state: 'RM', country: 'Chile' },
  { city: 'Hong Kong', state: 'HK', country: 'Hong Kong' },
  { city: 'Edinburgh', state: 'Scotland', country: 'United Kingdom' },
  { city: 'Whistler', state: 'BC', country: 'Canada' },
]

export function generateRunnerName(prng: () => number): { firstName: string; lastName: string; gender: 'male' | 'female' } {
  // 60% male, 40% female to reflect ultra demographics
  const gender: 'male' | 'female' = prng() < 0.6 ? 'male' : 'female'
  const firstName = gender === 'male'
    ? seededChoice(prng, MALE_FIRST_NAMES)
    : seededChoice(prng, FEMALE_FIRST_NAMES)
  const lastName = seededChoice(prng, LAST_NAMES)
  return { firstName, lastName, gender }
}

export function generateAge(prng: () => number): number {
  // Bell curve centered at 40, stddev 8, clamped to 20-70
  const raw = seededGaussian(prng, 40, 8)
  return Math.max(20, Math.min(70, Math.round(raw)))
}

export function generateHometown(prng: () => number): { city: string; state: string; country: string } {
  // 75% US, 25% international
  if (prng() < 0.75) {
    const loc = seededChoice(prng, US_CITIES)
    return { city: loc.city, state: loc.state, country: 'US' }
  }
  return seededChoice(prng, INTERNATIONAL_CITIES)
}
