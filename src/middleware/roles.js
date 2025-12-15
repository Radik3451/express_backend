const { ROLES } = require('../models/users');

/**
 * Middleware для проверки роли пользователя
 * @param {...string} allowedRoles - Разрешенные роли
 * @returns {Function} Express middleware
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Проверяем, что пользователь аутентифицирован
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    const userRole = req.user.role;

    // Проверяем, есть ли роль пользователя в списке разрешенных
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен. Недостаточно прав для выполнения данного действия.',
        required_roles: allowedRoles,
        your_role: userRole
      });
    }

    next();
  };
};

/**
 * Middleware: только для администраторов
 */
const adminOnly = requireRole(ROLES.ADMIN);

/**
 * Middleware: для менеджеров и администраторов
 */
const managerOrAdmin = requireRole(ROLES.MANAGER, ROLES.ADMIN);

/**
 * Middleware: для всех авторизованных пользователей
 */
const anyAuthenticated = requireRole(ROLES.USER, ROLES.MANAGER, ROLES.ADMIN);

module.exports = {
  requireRole,
  adminOnly,
  managerOrAdmin,
  anyAuthenticated,
  ROLES
};
