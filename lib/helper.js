/**
 * Find a branch by its name in an array of branches
 * @param {string} branchName - The name of the branch to find
 * @param {Array} branches - Array of branch objects with name property
 * @returns {Object|null} - The found branch object or null if not found
 */
export function findBranchByName(branchName = " ", branches) { 
  if (!branchName || !Array.isArray(branches) || branches.length === 0) {
    return null;
  }
  return branches.find( 
    (branch) => branch && branch.name && branch.name.toLowerCase() === branchName.toLowerCase() 
  ) || null; 
}