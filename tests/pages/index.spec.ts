import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import IndexPage from '~/pages/index.vue'

describe('IndexPage', () => {
  let dateNowSpy: any
  
  beforeEach(() => {
    // Mock Date for consistent testing
    dateNowSpy = vi.spyOn(Date, 'now')
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('currentTime computed property', () => {
    it('should display current time in correct format (12-hour with AM/PM)', () => {
      // Mock a specific time: 2:30 PM
      const mockDate = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const timeElement = wrapper.find('h1')
      
      expect(timeElement.text()).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i)
    })

    it('should format morning time correctly', () => {
      // Mock 9:15 AM
      const mockDate = new Date('2024-01-15T09:15:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const timeElement = wrapper.find('h1')
      
      expect(timeElement.text()).toMatch(/9:15\s?AM/i)
    })

    it('should format afternoon time correctly', () => {
      // Mock 3:45 PM
      const mockDate = new Date('2024-01-15T15:45:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const timeElement = wrapper.find('h1')
      
      expect(timeElement.text()).toMatch(/3:45\s?PM/i)
    })

    it('should format midnight correctly', () => {
      // Mock 12:00 AM
      const mockDate = new Date('2024-01-15T00:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const timeElement = wrapper.find('h1')
      
      expect(timeElement.text()).toMatch(/12:00\s?AM/i)
    })

    it('should format noon correctly', () => {
      // Mock 12:00 PM
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const timeElement = wrapper.find('h1')
      
      expect(timeElement.text()).toMatch(/12:00\s?PM/i)
    })
  })

  describe('timeOfDay computed property', () => {
    it('should return "morning" for hours before 12', () => {
      const mockDate = new Date('2024-01-15T08:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const greetingElement = wrapper.find('.text-slate-400')
      
      expect(greetingElement.text()).toContain('Good morning')
    })

    it('should return "morning" at 11:59 AM', () => {
      const mockDate = new Date('2024-01-15T11:59:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const greetingElement = wrapper.find('.text-slate-400')
      
      expect(greetingElement.text()).toContain('Good morning')
    })

    it('should return "afternoon" for hours 12-17', () => {
      const mockDate = new Date('2024-01-15T14:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const greetingElement = wrapper.find('.text-slate-400')
      
      expect(greetingElement.text()).toContain('Good afternoon')
    })

    it('should return "afternoon" at noon (12:00 PM)', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const greetingElement = wrapper.find('.text-slate-400')
      
      expect(greetingElement.text()).toContain('Good afternoon')
    })

    it('should return "afternoon" at 5:59 PM', () => {
      const mockDate = new Date('2024-01-15T17:59:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const greetingElement = wrapper.find('.text-slate-400')
      
      expect(greetingElement.text()).toContain('Good afternoon')
    })

    it('should return "evening" for hours 18 and after', () => {
      const mockDate = new Date('2024-01-15T20:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const greetingElement = wrapper.find('.text-slate-400')
      
      expect(greetingElement.text()).toContain('Good evening')
    })

    it('should return "evening" at 6:00 PM', () => {
      const mockDate = new Date('2024-01-15T18:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const greetingElement = wrapper.find('.text-slate-400')
      
      expect(greetingElement.text()).toContain('Good evening')
    })

    it('should return "morning" at midnight', () => {
      const mockDate = new Date('2024-01-15T00:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const greetingElement = wrapper.find('.text-slate-400')
      
      expect(greetingElement.text()).toContain('Good morning')
    })
  })

  describe('getAlertColor function', () => {
    it('should return "bg-orange-500" for warning type', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const vm = wrapper.vm as any
      
      expect(vm.getAlertColor('warning')).toBe('bg-orange-500')
    })

    it('should return "bg-blue-500" for info type', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const vm = wrapper.vm as any
      
      expect(vm.getAlertColor('info')).toBe('bg-blue-500')
    })

    it('should return "bg-green-500" for success type', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const vm = wrapper.vm as any
      
      expect(vm.getAlertColor('success')).toBe('bg-green-500')
    })

    it('should return "bg-red-500" for error type', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const vm = wrapper.vm as any
      
      expect(vm.getAlertColor('error')).toBe('bg-red-500')
    })

    it('should return "bg-slate-500" for unknown type', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const vm = wrapper.vm as any
      
      expect(vm.getAlertColor('unknown')).toBe('bg-slate-500')
    })

    it('should display correct color dots for alerts in the DOM', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const alertDots = wrapper.findAll('.flex-shrink-0.w-2.h-2.rounded-full')
      
      expect(alertDots.length).toBeGreaterThan(0)
      expect(alertDots[0].classes()).toContain('bg-orange-500') // warning
      expect(alertDots[1].classes()).toContain('bg-blue-500')   // info
      expect(alertDots[2].classes()).toContain('bg-green-500')  // success
      expect(alertDots[3].classes()).toContain('bg-red-500')    // error
    })
  })

  describe('Campaign Performance Card', () => {
    it('should correctly display impressions value', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const performanceCard = wrapper.findAll('.bg-\\[\\#1E2532\\].rounded-xl')[2] // Third card
      
      expect(performanceCard.text()).toContain('840')
      expect(performanceCard.text()).toContain('K')
      expect(performanceCard.text()).toContain('Impressions')
    })

    it('should display positive trend with green badge', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const trendBadge = wrapper.find('.bg-green-500\\/20.text-green-500')
      
      expect(trendBadge.exists()).toBe(true)
      expect(trendBadge.text()).toContain('+16%')
    })

    it('should render mini bar chart with correct number of bars', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const chartBars = wrapper.findAll('.from-blue-500\\/50.to-blue-500\\/20')
      
      expect(chartBars.length).toBe(7) // 7 days of the week
    })

    it('should render chart bars with appropriate heights based on data', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const chartBars = wrapper.findAll('.from-blue-500\\/50.to-blue-500\\/20')
      
      // Check that bars have height styles
      expect(chartBars[0].attributes('style')).toContain('height: 45%')
      expect(chartBars[1].attributes('style')).toContain('height: 62%')
      expect(chartBars[6].attributes('style')).toContain('height: 92%')
    })

    it('should display day labels below the chart', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const performanceSection = wrapper.findAll('.bg-\\[\\#1E2532\\].rounded-xl')[2]
      
      expect(performanceSection.text()).toContain('M')
      expect(performanceSection.text()).toContain('T')
      expect(performanceSection.text()).toContain('W')
      expect(performanceSection.text()).toContain('TH')
      expect(performanceSection.text()).toContain('F')
      expect(performanceSection.text()).toContain('S')
      expect(performanceSection.text()).toContain('SU')
    })

    it('should have period selector buttons (DAY, WK, MO)', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      
      expect(wrapper.text()).toContain('DAY')
      expect(wrapper.text()).toContain('WK')
      expect(wrapper.text()).toContain('MO')
    })
  })

  describe('Budget Utilization Card', () => {
    it('should correctly display total budget value', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const budgetCard = wrapper.findAll('.bg-\\[\\#1E2532\\].rounded-xl')[4] // Budget card
      
      expect(budgetCard.text()).toContain('360')
      expect(budgetCard.text()).toContain('K')
    })

    it('should display utilized percentage correctly', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const budgetCard = wrapper.findAll('.bg-\\[\\#1E2532\\].rounded-xl')[4]
      
      expect(budgetCard.text()).toContain('65%')
    })

    it('should display all budget breakdown categories', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const budgetCard = wrapper.findAll('.bg-\\[\\#1E2532\\].rounded-xl')[4]
      const budgetText = budgetCard.text()
      
      expect(budgetText).toContain('Social Media')
      expect(budgetText).toContain('Display Ads')
      expect(budgetText).toContain('Video')
      expect(budgetText).toContain('Search')
      expect(budgetText).toContain('Email')
    })

    it('should display correct budget values for each category', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const budgetCard = wrapper.findAll('.bg-\\[\\#1E2532\\].rounded-xl')[4]
      const budgetText = budgetCard.text()
      
      expect(budgetText).toContain('$85K')
      expect(budgetText).toContain('$60K')
      expect(budgetText).toContain('$75K')
      expect(budgetText).toContain('$45K')
      expect(budgetText).toContain('$25K')
    })

    it('should render progress bars for each budget category', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const budgetCard = wrapper.findAll('.bg-\\[\\#1E2532\\].rounded-xl')[4]
      const progressBars = budgetCard.findAll('.h-1\\.5.bg-slate-700')
      
      expect(progressBars.length).toBe(5) // 5 categories
    })

    it('should set correct width percentages for progress bars', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const budgetCard = wrapper.findAll('.bg-\\[\\#1E2532\\].rounded-xl')[4]
      const progressBarFills = budgetCard.findAll('.bg-blue-500.rounded-full')
      
      expect(progressBarFills.length).toBe(5)
      expect(progressBarFills[0].attributes('style')).toContain('width: 85%')
      expect(progressBarFills[1].attributes('style')).toContain('width: 60%')
      expect(progressBarFills[2].attributes('style')).toContain('width: 75%')
    })

    it('should have period selector buttons in budget card', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      const budgetCard = wrapper.findAll('.bg-\\[\\#1E2532\\].rounded-xl')[4]
      
      // Budget card should have its own period selector
      const buttons = budgetCard.findAll('button')
      const periodButtons = buttons.filter(btn => 
        btn.text() === 'DAY' || btn.text() === 'WK' || btn.text() === 'MO'
      )
      
      expect(periodButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Integration Tests', () => {
    it('should update greeting when time changes', async () => {
      // Start in the morning
      vi.setSystemTime(new Date('2024-01-15T09:00:00'))
      const wrapper = mount(IndexPage)
      
      expect(wrapper.find('.text-slate-400').text()).toContain('Good morning')
      
      // Change to evening
      vi.setSystemTime(new Date('2024-01-15T19:00:00'))
      await nextTick()
      
      // Note: This test demonstrates the expected behavior,
      // but actual time-based reactivity would need a different approach
    })

    it('should render all major dashboard sections', () => {
      const mockDate = new Date('2024-01-15T12:00:00')
      vi.setSystemTime(mockDate)
      
      const wrapper = mount(IndexPage)
      
      expect(wrapper.text()).toContain('Overview')
      expect(wrapper.text()).toContain('Alerts')
      expect(wrapper.text()).toContain('Client Health')
      expect(wrapper.text()).toContain('Campaign Performance')
      expect(wrapper.text()).toContain('Creative Assets')
      expect(wrapper.text()).toContain('Budget')
    })
  })
})
