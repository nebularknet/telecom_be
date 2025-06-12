// Example Permission Mapping
// This would typically be more granular and potentially stored in a database
// or a more sophisticated configuration management system.

const permissions = {
  // Platform-level admin, can do almost anything
  admin: [
    'admin:manage_tenants',
    'admin:manage_users_all', // Manage users across all tenants
    'admin:view_system_logs',
    // Can also do what a tenant_admin or client can do, possibly by inheriting or explicit listing
    'tenant:manage_settings', // Example: If super admin can manage settings for any tenant
    'tenant:manage_users',    // Example: If super admin can manage users for any tenant
    'phonenumber:validate',
    'phonenumber:history:read_all', // Read history across tenants
    'file:upload', // Might be restricted for platform admin
    'file:process_all', // Process files for any tenant
  ],
  // Role for a user who administers a specific tenant
  tenant_admin: [
    'tenant:manage_settings',   // Manage settings for their own tenant
    'tenant:manage_users',      // Manage users within their own tenant
    'tenant:view_billing',      // View billing for their own tenant
    'phonenumber:validate',
    'phonenumber:history:read_own', // Read history for their own tenant
    'file:upload',
    'file:process_own',         // Process files for their own tenant
    'user:create_within_tenant',
    'user:read_within_tenant',
    'user:edit_within_tenant',
    'user:delete_within_tenant',
  ],
  // Standard user within a tenant
  client: [
    'phonenumber:validate',
    'phonenumber:history:read_own', // Read their own validation history (or tenant's based on rules)
    'file:upload',
    // Typically, clients might not process files directly; this depends on the app
    // 'file:process_own',
    'user:read_self', // View their own profile
    'user:edit_self', // Edit their own profile
  ],
  // A potential role if there's a billing-specific user for a tenant
  billing_manager: [
    'tenant:view_billing',
    'tenant:manage_subscription', // Hypothetical
  ],
  // Add other roles as needed
};

// Function to check if a role has a specific permission
// This is a simple implementation; a more complex one might involve wildcard permissions, etc.
const hasPermission = (role, permission) => {
  if (!permissions[role]) {
    return false;
  }
  return permissions[role].includes(permission);
};

module.exports = {
  permissions,
  hasPermission,
};
