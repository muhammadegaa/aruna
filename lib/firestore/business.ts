// Compatibility layer - re-export from new location
// TODO: Update all imports to use lib/data/businesses directly
export {
  getBusiness,
  getBusinessesByOwner,
  getBusinessesByOrg,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getEntities,
  addEntity,
  getTransactions,
  addTransaction,
  getFinancialConfig,
  setFinancialConfig,
  getMetricsDaily,
  addAgentLog,
  getAgentLogs,
} from "../data/businesses";
