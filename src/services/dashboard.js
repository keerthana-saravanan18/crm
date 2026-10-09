import { getCustomers } from './customers.js'
import { getLeads } from './leads.js'
import { getDeals } from './deals.js'
import { getTasks } from './tasks.js'
import { getActivities } from './activities.js'

export async function getDashboardData() {
  const [customers, leads, deals, tasks, activities] = await Promise.all([
    getCustomers(),
    getLeads(),
    getDeals(),
    getTasks(),
    getActivities(),
  ])

  return {
    customers,
    leads,
    deals,
    tasks,
    activities,
  }
}
