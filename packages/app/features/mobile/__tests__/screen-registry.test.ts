// @ts-nocheck
import {
  SCREEN_COMPONENTS,
  SCREEN_GROUPS,
  SCREEN_COMPONENTS_BY_GROUP,
  getScreenComponent,
  getScreenComponentsForGroup,
} from '../screen-registry'
import type { ScreenName } from '../screen-registry'

describe('screen-registry', () => {
  describe('SCREEN_GROUPS', () => {
    it('defines all 5 groups', () => {
      expect(Object.keys(SCREEN_GROUPS)).toEqual(
        expect.arrayContaining(['auth', 'main', 'training', 'competition', 'utility'])
      )
    })

    it('auth group has 3 screens', () => {
      expect(SCREEN_GROUPS.auth).toHaveLength(3)
      expect(SCREEN_GROUPS.auth).toContain('Onboarding')
      expect(SCREEN_GROUPS.auth).toContain('Login')
      expect(SCREEN_GROUPS.auth).toContain('Register')
    })

    it('main group has 5 screens', () => {
      expect(SCREEN_GROUPS.main).toHaveLength(5)
    })

    it('training group has 3 screens', () => {
      expect(SCREEN_GROUPS.training).toHaveLength(3)
    })

    it('competition group has 3 screens', () => {
      expect(SCREEN_GROUPS.competition).toHaveLength(3)
    })

    it('utility group has 2 screens', () => {
      expect(SCREEN_GROUPS.utility).toHaveLength(2)
    })
  })

  describe('SCREEN_COMPONENTS', () => {
    it('contains all 16 screens', () => {
      const allScreenNames = [
        ...SCREEN_GROUPS.auth,
        ...SCREEN_GROUPS.main,
        ...SCREEN_GROUPS.training,
        ...SCREEN_GROUPS.competition,
        ...SCREEN_GROUPS.utility,
      ]
      expect(Object.keys(SCREEN_COMPONENTS)).toHaveLength(allScreenNames.length)
      allScreenNames.forEach((name) => {
        expect(SCREEN_COMPONENTS).toHaveProperty(name)
      })
    })

    it('all components are defined (not null/undefined)', () => {
      Object.entries(SCREEN_COMPONENTS).forEach(([name, component]) => {
        expect(component).toBeDefined()
        expect(component).not.toBeNull()
      })
    })
  })

  describe('SCREEN_COMPONENTS_BY_GROUP', () => {
    it('has all 5 groups', () => {
      expect(SCREEN_COMPONENTS_BY_GROUP).toHaveProperty('auth')
      expect(SCREEN_COMPONENTS_BY_GROUP).toHaveProperty('main')
      expect(SCREEN_COMPONENTS_BY_GROUP).toHaveProperty('training')
      expect(SCREEN_COMPONENTS_BY_GROUP).toHaveProperty('competition')
      expect(SCREEN_COMPONENTS_BY_GROUP).toHaveProperty('utility')
    })
  })

  describe('getScreenComponent', () => {
    it('returns a lazy component for a known screen', () => {
      const component = getScreenComponent('Login')
      expect(component).toBeDefined()
      expect(component).toBe(SCREEN_COMPONENTS.Login)
    })

    it('returns MissingScreen fallback for unknown name', () => {
      const component = getScreenComponent('NonExistentScreen')
      expect(component).toBeDefined()
      // Should be a function component (not a lazy component)
      expect(typeof component).toBe('function')
    })
  })

  describe('getScreenComponentsForGroup', () => {
    it('returns auth components', () => {
      const auth = getScreenComponentsForGroup('auth')
      expect(auth).toHaveProperty('Onboarding')
      expect(auth).toHaveProperty('Login')
      expect(auth).toHaveProperty('Register')
    })

    it('returns competition components', () => {
      const comp = getScreenComponentsForGroup('competition')
      expect(comp).toHaveProperty('LiveScoring')
      expect(comp).toHaveProperty('BracketView')
      expect(comp).toHaveProperty('MatchDetail')
    })
  })
})
